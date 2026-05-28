# Skeleton

**Live:** https://lucca-pereira.github.io/Skeleton/

Anatomical 3D learning tool for a Final Degree Project (TFG). Students identify muscle origin and insertion points by clicking attachment zones on a 3D bone model.

## Structure

```
TFG/
├── bones/                    # Main application (Three.js + Svelte + Vite)
│   ├── index.html           # Entry point
│   ├── main.js              # Scene setup: loads GLB, wires editor + quiz
│   ├── arm.glb              # 3D bone model
│   │
│   ├── editor/              # Paint editor — define zones and muscles
│   │   ├── editor.js        # Init: mounts Svelte panel, handles paint events
│   │   ├── EditorPanel.svelte  # Sidebar UI (muscles list + zones list + save)
│   │   ├── painter.js       # Face-index overlay mesh, zone colour management
│   │   ├── muscleData.js    # Muscle CRUD + JSON export
│   │   ├── stores.js        # Svelte stores: zones, activeZone, editMode, muscles
│   │   └── fileSystem.js    # POST /save → writes JSON to disk via Vite middleware
│   │
│   ├── quiz/                # Quiz mode — test origin/insertion knowledge
│   │   ├── quiz.js          # Init: loads data files, builds lookup, handles clicks
│   │   ├── QuizPanel.svelte # Bottom-left UI: muscle name, selections, result
│   │   └── quizStores.js    # Quiz state: current muscle, selections, score
│   │
│   ├── data/                # Persisted anatomy data (written by editor, read by quiz)
│   │   ├── areas.json       # { zoneName: [faceIndex, ...] }
│   │   └── muscles.json     # [{ name, origin, insertion, action, innervation }]
│   │
│   ├── vite.config.js       # Vite config: Svelte plugin + /data/* middleware + /save endpoint
│   └── package.json
│
└── webgl/                   # Early prototype — basic Three.js viewer (reference only)
```

## Workflow

### 1. Run the editor (dev server required for file saving)

```bash
cd bones
npm install
npm run dev
```

Open `http://localhost:5173`.

- Press **E** to toggle edit mode
- In the **Muscles** panel: enter a muscle name, origin zone name, insertion zone name → **Add**
- Paint faces on the bone by clicking/dragging in edit mode while a zone is selected
- Press **Save** to write `data/areas.json` and `data/muscles.json`

### 2. Quiz mode

Quiz activates automatically once both `data/areas.json` and `data/muscles.json` exist and contain data. Click two zones on the bone to identify a muscle's origin and insertion.

## Tech

- [Three.js](https://threejs.org/) — 3D scene, raycasting, overlay mesh
- [Svelte 5](https://svelte.dev/) — reactive editor and quiz UI
- [Vite 8](https://vitejs.dev/) — dev server + build tool
- GLB/GLTF — bone model format (created in Blender)

## Build

```bash
cd bones
npm run build   # outputs to bones/dist/
```

For deployment, copy `dist/` to any static host. Note: the `/save` endpoint (for writing JSON from the editor) only works in dev mode — the quiz works on any static host once the data files are committed.
