import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  test: {
    exclude: ['node_modules', 'dist', 'e2e']
  },
  server: {
    port: 3001,
    proxy: {
      '/albums': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
