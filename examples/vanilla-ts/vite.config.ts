import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    fs: {
      // Allow serving files from outside the project root
      allow: ['..', '../..']
    }
  }
})