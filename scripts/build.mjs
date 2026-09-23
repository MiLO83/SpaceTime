import { mkdir, copyFile } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const file of ['index.html','proposal.html','style.css','app.js','physics.js','sampler.js']) await copyFile(file, `dist/${file}`);
