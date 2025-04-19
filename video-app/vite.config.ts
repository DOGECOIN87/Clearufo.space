import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Use relative paths for GitHub Pages compatibility
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
