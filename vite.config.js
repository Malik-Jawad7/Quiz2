// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',  // localhost کی بجائے 127.0.0.1 استعمال کریں
    port: 5173,
    strictPort: false,   // strictPort کو false کریں
    hmr: {
      protocol: 'ws',
      host: '127.0.0.1',
      port: 5173,
      clientPort: 5173
    },
    watch: {
      usePolling: true,  // Polling enable کریں
      interval: 1000
    },
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    chunkSizeWarningLimit: 1000
  },
  preview: {
    port: 5173,
    host: '127.0.0.1'
  }
});