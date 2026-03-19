import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0', // Permite accesul din rețea
    allowedHosts: [
      'handmade-suggest-troops-handmade.trycloudflare.com'
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src'),
    },
  },
  build: {
    outDir: 'dist',
  }
});