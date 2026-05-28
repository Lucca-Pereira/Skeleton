import { writable } from 'svelte/store';
import {
  GoogleAuthProvider, signInWithPopup,
  signOut as firebaseSignOut, onAuthStateChanged,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.js';

export const currentUser = writable(null);
export const userRole    = writable(null); // 'admin' | 'teacher' | 'student' | null
export const authReady   = writable(false);

const provider = new GoogleAuthProvider();

export async function signIn() {
  await signInWithPopup(auth, provider);
}

export async function signOut() {
  await firebaseSignOut(auth);
}

onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser.set(user);
    const role = await ensureUserDoc(user);
    userRole.set(role);
  } else {
    currentUser.set(null);
    userRole.set(null);
  }
  authReady.set(true);
});

async function ensureUserDoc(user) {
  const ref  = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email:       user.email,
      displayName: user.displayName,
      photoURL:    user.photoURL,
      role:        'student',
      createdAt:   serverTimestamp(),
    });
    return 'student';
  }
  return snap.data().role ?? 'student';
}
