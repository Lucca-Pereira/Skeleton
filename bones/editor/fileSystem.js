export async function saveToProjectFolder(filename, content) {
  if (!import.meta.env.DEV) return; // no server in production — data persists via localStorage
  const res = await fetch('/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, content }),
  });
  if (res.ok) console.log(`[fs] saved ${filename}`);
  else console.error(`[fs] failed to save ${filename}`);
}
