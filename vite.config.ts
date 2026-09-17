import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// The site calls /api on its own origin. In development Vite proxies that to
// the local API; in production nginx proxies it to the API container.
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.DEV_API_URL ?? 'http://127.0.0.1:3101',
          changeOrigin: true,
        },
      },
    },
  }
})
