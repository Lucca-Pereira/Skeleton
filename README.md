# Skeleton

**Live:** https://lucca-pereira.github.io/Skeleton/

Anatomical 3D learning tool for a Final Degree Project (TFG). Students identify muscle origin and insertion points by clicking attachment zones on a 3D bone model.

## Roles

| Role    | Access |
|---------|--------|
| Student | Quiz only |
| Teacher | Quiz + editor (define zones and muscles) |
| Admin   | Quiz + editor + can promote users via Firebase console |

All users sign in with Google. New accounts default to **student**. An admin promotes users by editing their `role` field in the Firebase console (Firestore → users → document → role).

## Workflow

### Editing anatomy data (teacher/admin, local dev only)

```bash
cd bones
npm install
npm run dev
```

1. Sign in and open the editor from the account dropdown (top right)
2. Add muscles (name, origin zone, insertion zone)
3. Select a zone and paint its faces on the bone by clicking/dragging
4. Press **Save**
5. `git add bones/public/data/ && git commit && git push`

GitHub Actions rebuilds and the updated data is live for all users.

> **Note:** Saving on the deployed site only persists data in that browser's localStorage. To update data for everyone, always edit locally and commit.

### Quiz (students)

Sign in → click two zones on the bone to identify a muscle's origin and insertion. Order doesn't matter. Use **Skip** to get a different muscle or **Try Again** after an incorrect answer.

## Tech stack

- [Three.js](https://threejs.org/) — 3D scene, raycasting, colour overlay
- [Svelte 5](https://svelte.dev/) — editor and quiz UI
- [Vite 8](https://vitejs.dev/) — dev server and build tool
- [Firebase](https://firebase.google.com/) — Google Auth + Firestore (user roles and quiz progress)
- GLB/GLTF — bone model format (authored in Blender)

## Deployment

Deployed automatically to GitHub Pages via GitHub Actions on every push to `main`.
