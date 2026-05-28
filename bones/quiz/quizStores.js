import { writable, get } from 'svelte/store';

export const quizMuscle    = writable(null);
export const quizSelections = writable([]);
export const quizResult    = writable(null); // null | 'correct' | 'incorrect'
export const quizScore     = writable({ correct: 0, total: 0 });
export const quizReady     = writable(false); // true when data loaded

let muscleList  = [];
let highlightFn = null;
let clearFn     = null;
let progressFn  = null; // (muscleName, wasCorrect) => void

export function setMuscleList(list)        { muscleList = list; }
export function setHighlightCallback(fn)   { highlightFn = fn; }
export function setClearCallback(fn)       { clearFn = fn; }
export function setProgressCallback(fn)    { progressFn = fn; }

export function nextMuscle() {
  if (clearFn) clearFn();
  quizSelections.set([]);
  quizResult.set(null);
  if (!muscleList.length) return;
  quizMuscle.set(muscleList[Math.floor(Math.random() * muscleList.length)]);
}

export function retryMuscle() {
  if (clearFn) clearFn();
  quizSelections.set([]);
  quizResult.set(null);
}

export function handleZoneClick(zoneName) {
  if (get(quizResult)) return;

  const sel = get(quizSelections);
  if (sel.includes(zoneName) || sel.length >= 2) return;

  const next = [...sel, zoneName];
  quizSelections.set(next);
  if (highlightFn) highlightFn(zoneName, next.length === 1 ? 'first' : 'second');

  if (next.length === 2) setTimeout(() => checkAnswer(next), 300);
}

function checkAnswer(sel) {
  const muscle = get(quizMuscle);
  if (!muscle) return;

  const correct =
    (sel[0] === muscle.origin   && sel[1] === muscle.insertion) ||
    (sel[0] === muscle.insertion && sel[1] === muscle.origin);

  sel.forEach(z => { if (highlightFn) highlightFn(z, correct ? 'correct' : 'wrong'); });

  if (correct) quizScore.update(s => ({ correct: s.correct + 1, total: s.total + 1 }));
  else         quizScore.update(s => ({ ...s, total: s.total + 1 }));

  if (progressFn) progressFn(muscle.name, correct);
  quizResult.set(correct ? 'correct' : 'incorrect');
}
