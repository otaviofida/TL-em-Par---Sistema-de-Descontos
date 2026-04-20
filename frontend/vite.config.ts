import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isMobile = mode === 'mobile'

  return {
    plugins: isMobile ? [react()] : [react(), basicSsl()],
    server: {
      host: true,
      proxy: {
        '/api': {
          target: 'http://localhost:3333',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:3333',
          changeOrigin: true,
        },
      },
    },
  }
})
