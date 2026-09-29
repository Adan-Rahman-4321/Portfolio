import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Try 5173 first; if busy, pick the next available port automatically
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        // Forward whatever port Vite ends up using back to Express CORS
        configure: (proxy) => {
          proxy.on('error', (err) => console.error('[vite proxy]', err.message));
        },
      },
    },
  },
});
