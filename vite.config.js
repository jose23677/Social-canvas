import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/Social-canvas/',
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: {
          fabric: ['fabric'],
          vendor: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
  },
})
