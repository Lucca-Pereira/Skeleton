# Skeleton — bones

Interactive 3D anatomy tool for learning muscle attachments. Built with Three.js + Svelte + Vite.

## How to run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## File structure

```
bones/
├── index.html           # Entry point
├── main.js              # Three.js scene: camera, lights, model load, render loop
├── arm.glb              # 3D bone model (humerus)
├── vite.config.js       # Svelte plugin + /data/* serve + /save write endpoint
│
├── editor/              # Paint editor
│   ├── editor.js        # Three.js ↔ Svelte bridge (keyboard, pointer, raycasting)
│   ├── EditorPanel.svelte  # Right sidebar UI
│   ├── painter.js       # Overlay mesh, face painting, zone colours
│   ├── muscleData.js    # Muscle CRUD + JSON export
│   ├── stores.js        # Svelte stores: zones, muscles, editMode, activeZone
│   └── fileSystem.js    # POST /save → writes JSON to data/ via Vite middleware
│
├── quiz/                # Quiz mode
│   ├── quiz.js          # Loads data files, face lookup maps, click handler
│   ├── QuizPanel.svelte # Bottom-left UI: muscle name, selections, result
│   └── quizStores.js    # Quiz state: current muscle, selections, score
│
└── data/                # Persisted anatomy data (written by editor, read by quiz)
    ├── areas.json        # { zoneName: [faceIndex, ...] }
    └── muscles.json      # [{ name, origin, insertion, action, innervation }]
```

## Workflow

### 1. Define muscles (editor)

Press **E** to toggle edit mode. In the right sidebar:

1. Enter muscle name + origin zone name + insertion zone name → **Add Muscle**  
   Zones are created automatically if they don't exist yet.
2. Select a zone from the list.
3. Click/drag on the bone to paint its faces.
4. Repeat for all zones.
5. **Save** — writes `data/areas.json` and `data/muscles.json` to disk.

### 2. Quiz mode

Quiz activates automatically once both data files exist and have content. Click two zones on the bone to identify the muscle's origin and insertion.

## Important

**Finalise `arm.glb` before painting.** Zone data is stored as triangle face indices of the mesh. If the model changes after painting, all zones need to be repainted.

## Build for deployment

```bash
npm run build   # outputs to dist/
```

Deploy `dist/` to any static host. The quiz works fully on a static host. The `/save` write endpoint only works in dev mode — commit `data/` after editing.
