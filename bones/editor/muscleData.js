import { get } from 'svelte/store';
import { muscles } from './stores.js';
import { saveToProjectFolder } from './fileSystem.js';

export function addMuscle(entry) {
  muscles.update(m => [...m, { ...entry }]);
}

export function deleteMuscle(index) {
  muscles.update(m => m.filter((_, i) => i !== index));
}

export function saveMuscles() {
  localStorage.setItem('skeleton-muscles', JSON.stringify(get(muscles)));
  console.log('[muscles] saved', get(muscles).length, 'muscles');
}

export function loadMuscles(data) {
  muscles.set(data);
}

export function loadFromStorage() {
  const raw = localStorage.getItem('skeleton-muscles');
  if (!raw) return false;
  try {
    const data = JSON.parse(raw);
    if (!data.length) return false;
    muscles.set(data);
    return true;
  } catch { return false; }
}

export function exportMuscles() {
  saveToProjectFolder('muscles.json', JSON.stringify(get(muscles), null, 2));
}
