import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',  // Use absolute paths for easier GitHub Pages path resolution
  server: {
    port: 3000,
    host: true
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
