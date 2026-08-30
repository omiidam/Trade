import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          bootstrap: ['bootstrap'],
          apexcharts: ['apexcharts'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    hmr: false,
  },
});
