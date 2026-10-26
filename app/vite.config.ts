import { defineConfig } from 'vite';

/* Milestone 1 build foundation: offline-bundled Phaser 3 + TypeScript,
   relative base so the built shell can be previewed from any path. */
export default defineConfig({
  base: './',
  build: {
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
  },
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true, host: '127.0.0.1' },
});
