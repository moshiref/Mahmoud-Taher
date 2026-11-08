import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // An inline config stops Vite from picking up a postcss.config.* from a parent directory.
  css: { postcss: {} },
  server: { port: 5173, open: false },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    // The WebGL chunk (three + r3f + drei) is large by nature and lazy-loaded.
    chunkSizeWarningLimit: 1200,
  },
})
