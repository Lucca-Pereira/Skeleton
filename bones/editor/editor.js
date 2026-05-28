import * as THREE from 'three';
import { mount } from 'svelte';
import { get } from 'svelte/store';
import EditorPanel from './EditorPanel.svelte';
import * as painter from './painter.js';
import * as muscleData from './muscleData.js';
import { editMode, activeZone } from './stores.js';
import { reloadQuizData } from '../quiz/quiz.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
let isPainting = false;
let _renderer, _camera;
let _editorAllowed = false;

export function initEditor(scene, camera, renderer, boneMesh, controls, role) {
  _camera = camera;
  _renderer = renderer;
  _editorAllowed = role === 'admin' || role === 'teacher';

  painter.init(boneMesh);
  mount(EditorPanel, { target: document.body });
  attachEvents();
  tryLoad();
}

function attachEvents() {

  window.addEventListener('keydown', (e) => {
    if (!_editorAllowed) return;
    if ((e.key === 'e' || e.key === 'E') && document.activeElement.tagName !== 'INPUT') {
      editMode.update(v => {
        if (v) reloadQuizData();
        return !v;
      });
    }
  });

  _renderer.domElement.addEventListener('pointerdown', (e) => {
    if (!get(editMode) || e.button !== 0 || !get(activeZone)) return;
    updateMouse(e);
    raycaster.setFromCamera(mouse, _camera);
    const hits = raycaster.intersectObject(painter.getBoneMesh(), false);
    if (!hits.length) return;
    e.stopImmediatePropagation();
    isPainting = true;
    painter.paintFace(hits[0].faceIndex);
  }, true);

  _renderer.domElement.addEventListener('pointermove', (e) => {
    if (!get(editMode) || !isPainting) return;
    updateMouse(e);
    raycaster.setFromCamera(mouse, _camera);
    const hits = raycaster.intersectObject(painter.getBoneMesh(), false);
    if (hits.length) painter.paintFace(hits[0].faceIndex);
  });

  window.addEventListener('pointerup', () => { isPainting = false; });
}

function updateMouse(e) {
  const rect = _renderer.domElement.getBoundingClientRect();
  mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
}

async function tryLoad() {
  if (!painter.loadFromStorage()) {
    try {
      const res = await fetch(import.meta.env.BASE_URL + 'data/areas.json');
      if (res.ok) painter.loadZones(await res.json());
    } catch (_) {}
  }

  if (!muscleData.loadFromStorage()) {
    try {
      const res = await fetch(import.meta.env.BASE_URL + 'data/muscles.json');
      if (res.ok) muscleData.loadMuscles(await res.json());
    } catch (_) {}
  }
}
