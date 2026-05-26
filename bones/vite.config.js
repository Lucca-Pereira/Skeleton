import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: '/Squeleton/',
  plugins: [
    svelte(),
    {
      name: 'file-saver',
      configureServer(server) {
        server.middlewares.use('/save', (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', () => {
            try {
              const { filename, content } = JSON.parse(body);
              const safe = path.basename(filename);
              const dataDir = path.resolve(process.cwd(), 'public', 'data');
              if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
              fs.writeFileSync(path.join(dataDir, safe), content, 'utf-8');
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch (e) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: e.message }));
            }
          });
        });
      },
    },
  ],
});
