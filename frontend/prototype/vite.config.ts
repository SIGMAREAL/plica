import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { publicPages } from './build-pages.ts';

export default defineConfig({
  plugins: [react(), tailwindcss(), publicPages()],
  base: './',
  build: { rolldownOptions: { input: { app: 'index.html', components: 'components.html' } } },
  server: {
    port: 5187,
    strictPort: true,
    proxy: { '/api': 'http://127.0.0.1:8001', '/skill': 'http://127.0.0.1:8001' },
  },
});
