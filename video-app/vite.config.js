import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/Clearufo.space/', // Set base path for GitHub Pages
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
});
