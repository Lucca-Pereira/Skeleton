import * as THREE from 'three';
import { get } from 'svelte/store';
import { zones, activeZone } from './stores.js';
import { saveToProjectFolder } from './fileSystem.js';

const PALETTE = [
  [1.0, 0.5, 0.0],
  [0.0, 0.9, 0.4],
  [0.2, 0.6, 1.0],
  [1.0, 0.2, 0.8],
  [0.9, 0.9, 0.0],
  [0.0, 0.9, 0.9],
  [1.0, 0.2, 0.2],
  [0.5, 0.2, 1.0],
];

let colorCounter = 0;
let overlayMesh = null;
let colorAttr = null;
let indexAttr = null;
let _boneMesh = null;
const faceData = {}; // { name: Set<faceIndex> } — internal, not in store

export function init(boneMesh) {
  _boneMesh = boneMesh;

  const geom = boneMesh.geometry.clone();
  const colors = new Float32Array(geom.attributes.position.count * 3);
  geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  colorAttr = geom.attributes.color;
  indexAttr = geom.index;

  overlayMesh = new THREE.Mesh(geom, new THREE.MeshBasicMaterial({
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    side: THREE.FrontSide,
  }));
  overlayMesh.visible = false;
  boneMesh.add(overlayMesh);
}

function paintVertsForFace(fi, r, g, b) {
  for (let v = 0; v < 3; v++) {
    const vi = indexAttr.getX(fi * 3 + v);
    colorAttr.setXYZ(vi, r, g, b);
  }
}

function repaintAll() {
  colorAttr.array.fill(0);
  for (const [name, zoneData] of Object.entries(get(zones))) {
    const [r, g, b] = PALETTE[zoneData.colorIdx % PALETTE.length];
    for (const fi of faceData[name] ?? []) paintVertsForFace(fi, r, g, b);
  }
  colorAttr.needsUpdate = true;
}

export function getBoneMesh() { return _boneMesh; }

export function getPaletteHex(colorIdx) {
  const [r, g, b] = PALETTE[colorIdx % PALETTE.length];
  return '#' + [r, g, b].map(v => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}

export function setOverlayVisible(v) {
  if (overlayMesh) overlayMesh.visible = v;
}

export function addZone(name) {
  if (get(zones)[name]) return;
  const colorIdx = colorCounter % PALETTE.length;
  colorCounter++;
  faceData[name] = new Set();
  zones.update(z => ({ ...z, [name]: { faceCount: 0, colorIdx } }));
}

export function paintFace(fi) {
  const zone = get(activeZone);
  if (!zone || !faceData[zone] || faceData[zone].has(fi)) return;

  faceData[zone].add(fi);
  const [r, g, b] = PALETTE[get(zones)[zone].colorIdx % PALETTE.length];
  paintVertsForFace(fi, r, g, b);
  colorAttr.needsUpdate = true;

  zones.update(z => ({ ...z, [zone]: { ...z[zone], faceCount: faceData[zone].size } }));
  setOverlayVisible(true);
}

export function clearZone(name) {
  if (!faceData[name]) return;
  faceData[name].clear();
  repaintAll();
  zones.update(z => ({ ...z, [name]: { ...z[name], faceCount: 0 } }));
}

export function deleteZone(name) {
  clearZone(name);
  delete faceData[name];
  zones.update(z => { const n = { ...z }; delete n[name]; return n; });
}

export function loadZones(data) {
  // data: { name: number[] } from areas.json
  // or { name: { indices, colorIdx } } from localStorage
  for (const [name, value] of Object.entries(data)) {
    const indices = Array.isArray(value) ? value : value.indices;
    const colorIdx = typeof value.colorIdx === 'number' ? value.colorIdx : colorCounter % PALETTE.length;
    colorCounter = Math.max(colorCounter, colorIdx + 1);

    faceData[name] = new Set(indices);
    zones.update(z => ({ ...z, [name]: { faceCount: indices.length, colorIdx } }));
  }
  if (Object.keys(data).length) {
    repaintAll();
    setOverlayVisible(true);
  }
}

export function saveToStorage() {
  const out = {};
  for (const [name, z] of Object.entries(get(zones))) {
    out[name] = { indices: [...(faceData[name] ?? [])], colorIdx: z.colorIdx };
  }
  localStorage.setItem('skeleton-zones', JSON.stringify(out));
  console.log('[painter] saved', Object.keys(out).length, 'zones');
}

export function loadFromStorage() {
  const raw = localStorage.getItem('skeleton-zones');
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    if (!Object.keys(data).length) return false;
    loadZones(data);
    return true;
  } catch { return false; }
}

export function exportZones() {
  const out = {};
  for (const [name, indices] of Object.entries(faceData)) {
    out[name] = [...indices].sort((a, b) => a - b);
  }
  saveToProjectFolder('areas.json', JSON.stringify(out, null, 2));
}
