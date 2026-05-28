# Skeleton — bones

Interactive 3D anatomy tool. Built with Three.js + Svelte 5 + Vite 8 + Firebase.

## Running locally

```bash
npm install
npm run dev
```

## File structure

```
bones/
├── index.html              # Entry point
├── main.js                 # Scene setup, auth gating, initialises editor + quiz
├── vite.config.js          # Svelte plugin + /save write endpoint (dev only)
│
├── lib/
│   └── firebase.js         # Firebase app, auth, and Firestore instances
│
├── auth/
│   ├── auth.js             # Google sign-in, onAuthStateChanged, user doc creation
│   ├── AuthPanel.svelte    # Full-screen login overlay (shown when signed out)
│   └── UserPanel.svelte    # Top-right account chip with dropdown (editor toggle, sign out)
│
├── editor/                 # Paint editor — teachers/admins only
│   ├── editor.js           # Pointer events, raycasting, role gate for E key
│   ├── EditorPanel.svelte  # Right sidebar: muscle form, zone list, save button
│   ├── painter.js          # Indexed-geometry colour overlay, zone face data
│   ├── muscleData.js       # Muscle CRUD, localStorage + JSON export
│   ├── stores.js           # Svelte stores: zones, activeZone, editMode, muscles
│   └── fileSystem.js       # POST /save → writes JSON to public/data/ (dev only)
│
├── quiz/                   # Quiz mode — all signed-in users
│   ├── quiz.js             # Data loading, face lookup, click handler, Firestore progress
│   ├── QuizPanel.svelte    # Bottom-left UI: muscle prompt, selections, result, skip
│   └── stores.js           # Quiz state: current muscle, selections, score, callbacks
│
└── public/
    ├── arm.glb             # 3D bone model
    └── data/
        ├── areas.json      # { zoneName: [faceIndex, ...] }
        └── muscles.json    # [{ name, origin, insertion, action, innervation }]
```

## Data flow

- **Editor → localStorage** on Save (all environments)
- **Editor → `public/data/*.json`** on Save (dev only, via `/save` Vite middleware)
- **Quiz** reads localStorage first, falls back to `public/data/*.json`
- Closing the editor (E or dropdown) reloads quiz data from localStorage automatically
- **Firestore** stores per-user quiz progress: `users/{uid}/progress/{muscleName}`

## Making permanent data changes

1. Edit locally with `npm run dev`
2. Press **Save** in the editor
3. `git add public/data/ && git commit && git push`

GitHub Actions deploys the updated JSON to GitHub Pages.

## Important

**Finalise `arm.glb` before painting.** Zone data is stored as triangle face indices. If the model geometry changes after painting, all zones must be repainted.
