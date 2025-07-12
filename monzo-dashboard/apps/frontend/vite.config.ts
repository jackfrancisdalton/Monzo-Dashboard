import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({}) => {
  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
      'import.meta.env.VITE_FRONTEND_URL': JSON.stringify(process.env.VITE_FRONTEND_URL),
      'import.meta.env.VITE_MOCK_MONZO_URL': JSON.stringify(process.env.VITE_MOCK_MONZO_URL),
    }
  }
})