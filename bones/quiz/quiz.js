import * as THREE from 'three';
import { get } from 'svelte/store';
import { mount } from 'svelte';
import { editMode } from '../editor/stores.js';
import {
  setMuscleList, setHighlightCallback, setClearCallback,
  handleZoneClick, nextMuscle, quizReady,
} from './quizStores.js';
import QuizPanel from './QuizPanel.svelte';

const COLORS = {
  first:   [0.0, 0.5, 1.0],
  second:  [1.0, 0.5, 0.0],
  correct: [0.0, 1.0, 0.3],
  wrong:   [1.0, 0.1, 0.1],
};

let faceToZone  = {};
let zoneToFaces = {};
let quizColorAttr = null;
let boneMesh = null;
let _camera, _renderer;

const raycaster = new THREE.Raycaster();
const mouse     = new THREE.Vector2();

export async function initQuiz(scene, camera, renderer, mesh) {
  _camera   = camera;
  _renderer = renderer;
  boneMesh  = mesh;

  try {
    const [areasRes, musclesRes] = await Promise.all([
      fetch(import.meta.env.BASE_URL + 'data/areas.json'),
      fetch(import.meta.env.BASE_URL + 'data/muscles.json'),
    ]);
    console.log('[quiz] areas.json:', areasRes.ok, areasRes.status);
    console.log('[quiz] muscles.json:', musclesRes.ok, musclesRes.status);
    if (!areasRes.ok || !musclesRes.ok) {
      console.warn('[quiz] one or both files missing — quiz inactive');
      return;
    }

    const areas   = await areasRes.json();
    const muscles = await musclesRes.json();
    console.log('[quiz] zones loaded:', Object.keys(areas).length);
    console.log('[quiz] muscles loaded:', muscles.length);

    buildLookup(areas);
    buildOverlay();
    setMuscleList(muscles);
    setHighlightCallback(highlightZone);
    setClearCallback(clearHighlights);

    mount(QuizPanel, { target: document.body });
    attachEvents();
    nextMuscle();
    quizReady.set(true);
    console.log('[quiz] ready');
  } catch (e) {
    console.error('[quiz] failed to start:', e);
  }
}

function buildLookup(areas) {
  for (const [name, indices] of Object.entries(areas)) {
    zoneToFaces[name] = new Set(indices);
    for (const fi of indices) faceToZone[fi] = name;
  }
}

function buildOverlay() {
  const geom   = boneMesh.geometry.toNonIndexed();
  const colors = new Float32Array(geom.attributes.position.count * 3);
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  quizColorAttr = geom.attributes.color;

  const mesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  }));
  mesh.renderOrder = 2;
  boneMesh.add(mesh);
}

function attachEvents() {
  _renderer.domElement.addEventListener('click', (e) => {
    if (get(editMode)) return;
    const rect = _renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width)  *  2 - 1;
    mouse.y = ((e.clientY - rect.top)  / rect.height) * -2 + 1;
    raycaster.setFromCamera(mouse, _camera);
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
    const base = fi * 3;
    for (let v = 0; v < 3; v++) quizColorAttr.setXYZ(base + v, r, g, b);
  }
  quizColorAttr.needsUpdate = true;
}

function clearHighlights() {
  for (let i = 0; i < quizColorAttr.count; i++) quizColorAttr.setXYZ(i, 0, 0, 0);
  quizColorAttr.needsUpdate = true;
}
