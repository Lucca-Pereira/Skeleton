import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey:            "AIzaSyCgkrWdPMzX-i02AwSuZvMcMvJJqEQOST4",
  authDomain:        "skeleton-87201.firebaseapp.com",
  projectId:         "skeleton-87201",
  storageBucket:     "skeleton-87201.firebasestorage.app",
  messagingSenderId: "698392931977",
  appId:             "1:698392931977:web:513d1ebd787417ff786058",
};

export const app  = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db   = getFirestore(app);
