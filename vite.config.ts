import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'https://backend-data-sentinel.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, '/v1')
      }
    }
  },
  define: {
    // Usar un valor por defecto sin intentar acceder a import.meta.env
    'import.meta.env.VITE_API_URL': JSON.stringify('https://backend-data-sentinel.vercel.app/v1')
  }
})
