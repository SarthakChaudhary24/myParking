import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  // Dev server settings
  server: {
    port: 5173,
    open: true,   // auto-open browser on npm run dev
  },

  // Production build output folder
  build: {
    outDir: 'dist',
  },
})