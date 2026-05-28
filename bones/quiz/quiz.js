import * as THREE from 'three';
import { get } from 'svelte/store';
import { mount } from 'svelte';
import { editMode } from '../editor/stores.js';
import {
  setMuscleList, setHighlightCallback, setClearCallback, setProgressCallback,
  handleZoneClick, nextMuscle, quizReady,
} from './stores.js';
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { currentUser } from '../auth/auth.js';
import QuizPanel from './QuizPanel.svelte';

const STORAGE_ZONES   = 'skeleton-zones';
const STORAGE_MUSCLES = 'skeleton-muscles';

const COLORS = {
  first:   [0.0, 0.5, 1.0],
  second:  [1.0, 0.5, 0.0],
  correct: [0.0, 1.0, 0.3],
  wrong:   [1.0, 0.1, 0.1],
};

let faceToZone    = {};
let zoneToFaces   = {};
let quizColorAttr = null;
let quizIndexAttr = null;
let boneMesh      = null;
let camera        = null;
let renderer      = null;

const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();

function areasFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_ZONES);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Object.keys(data).length) return null;
    const out = {};
    for (const [name, val] of Object.entries(data)) {
      out[name] = Array.isArray(val) ? val : val.indices;
    }
    return out;
  } catch { return null; }
}

function musclesFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_MUSCLES);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return data.length ? data : null;
  } catch { return null; }
}

export async function initQuiz(scene, _camera, _renderer, mesh) {
  camera   = _camera;
  renderer = _renderer;
  boneMesh = mesh;

  try {
    let areas   = areasFromStorage();
    let muscles = musclesFromStorage();

    if (!areas || !muscles) {
      const [areasRes, musclesRes] = await Promise.all([
        fetch(import.meta.env.BASE_URL + 'data/areas.json'),
        fetch(import.meta.env.BASE_URL + 'data/muscles.json'),
      ]);
      if (!areasRes.ok || !musclesRes.ok) {
        console.warn('[quiz] data files missing — quiz inactive');
        return;
      }
      if (!areas)   areas   = await areasRes.json();
      if (!muscles) muscles = await musclesRes.json();
    }

    buildLookup(areas);
    buildOverlay();
    setMuscleList(muscles);
    setHighlightCallback(highlightZone);
    setClearCallback(clearHighlights);
    setProgressCallback(recordProgress);

    mount(QuizPanel, { target: document.body });
    attachClickHandler();
    nextMuscle();
    quizReady.set(true);
  } catch (e) {
    console.error('[quiz] failed to start:', e);
  }
}

export function reloadQuizData() {
  if (!quizColorAttr) return;
  const areas   = areasFromStorage();
  const muscles = musclesFromStorage();
  if (!areas || !muscles) return;

  faceToZone  = {};
  zoneToFaces = {};
  buildLookup(areas);
  setMuscleList(muscles);
  clearHighlights();
  nextMuscle();
}

function buildLookup(areas) {
  for (const [name, indices] of Object.entries(areas)) {
    zoneToFaces[name] = new Set(indices);
    for (const fi of indices) faceToZone[fi] = name;
  }
}

function buildOverlay() {
  const geom   = boneMesh.geometry.clone();
  const colors = new Float32Array(geom.attributes.position.count * 3);
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  quizColorAttr = geom.attributes.color;
  quizIndexAttr = geom.index;

  const overlay = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  }));
  overlay.renderOrder = 2;
  boneMesh.add(overlay);
}

function attachClickHandler() {
  renderer.domElement.addEventListener('click', (e) => {
    if (get(editMode)) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
    mouse.y = ((e.clientY - rect.top)  / rect.height) * -2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(boneMesh, false);
    if (!hits.length) return;
    const zone = faceToZone[hits[0].faceIndex];
    if (zone) handleZoneClick(zone);
  });
}

function highlightZone(name, colorKey) {
  const faces = zoneToFaces[name];
  if (!faces) return;
  const [r, g, b] = COLORS[colorKey];
  for (const fi of faces) {
    for (let v = 0; v < 3; v++) {
      quizColorAttr.setXYZ(quizIndexAttr.getX(fi * 3 + v), r, g, b);
    }
  }
  quizColorAttr.needsUpdate = true;
}

function clearHighlights() {
  quizColorAttr.array.fill(0);
  quizColorAttr.needsUpdate = true;
}

async function recordProgress(muscleName, wasCorrect) {
  const user = get(currentUser);
  if (!user) return;
  const ref = doc(db, 'users', user.uid, 'progress', muscleName);
  await setDoc(ref, {
    attempts: increment(1),
    correct:  increment(wasCorrect ? 1 : 0),
    lastSeen: serverTimestamp(),
  }, { merge: true });
}
