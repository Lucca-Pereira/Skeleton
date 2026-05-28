import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { mount } from 'svelte';
import { get } from 'svelte/store';
import { initEditor } from './editor/editor.js';
import { initQuiz } from './quiz/quiz.js';
import { authReady, currentUser, userRole, canEdit } from './auth/auth.js';
import AuthPanel from './auth/AuthPanel.svelte';
import UserPanel from './auth/UserPanel.svelte';

mount(AuthPanel, { target: document.body });
mount(UserPanel, { target: document.body });

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 1, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 1.8));
const dirLight = new THREE.DirectionalLight(0xffffff, 0.4);
dirLight.position.set(5, 10, 7.5);
scene.add(dirLight);
const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
fillLight.position.set(-5, -5, -7.5);
scene.add(fillLight);

let boneMesh     = null;
let appReady     = false;
let authDone     = false;
let initialized  = false;

const loader = new GLTFLoader();
loader.load(import.meta.env.BASE_URL + 'arm.glb', (gltf) => {
  scene.add(gltf.scene);

  gltf.scene.traverse((child) => {
    if (child.isMesh && !child.name.startsWith('area_')) boneMesh = child;
  });

  const box    = new THREE.Box3().setFromObject(gltf.scene);
  const center = box.getCenter(new THREE.Vector3());
  const maxDim = Math.max(...box.getSize(new THREE.Vector3()).toArray());
  const scale  = 2 / maxDim;
  gltf.scene.scale.setScalar(scale);
  gltf.scene.position.sub(center.multiplyScalar(scale));
  controls.target.set(0, 0, 0);
  controls.update();

  appReady = true;
  tryInit();
}, undefined, (err) => console.error('Error loading model:', err));

// Wait for the user to be signed in, then start the app
authReady.subscribe((ready) => {
  if (!ready) return;
  const user = get(currentUser);
  if (!user) return; // still on login screen
  authDone = true;
  tryInit();
});

currentUser.subscribe((user) => {
  if (!user || !get(authReady)) return;
  authDone = true;
  tryInit();
});

function tryInit() {
  if (!appReady || !authDone || initialized) return;
  initialized = true;
  const role = get(userRole);
  initEditor(scene, camera, renderer, boneMesh, controls, role);
  initQuiz(scene, camera, renderer, boneMesh);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();
