import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  // load .env from monorepo root
  const rootEnv = loadEnv(mode, path.resolve(__dirname, '../../'), 'VITE_');

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    // TODO: review this approach to env variables and ensure no others are loaded
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(rootEnv.VITE_API_URL),
      'import.meta.env.VITE_FRONTEND_URL': JSON.stringify(rootEnv.VITE_FRONTEND_URL),
      'import.meta.env.VITE_MOCK_MONZO_URL': JSON.stringify(rootEnv.VITE_MOCK_MONZO_URL),
      'import.meta.env.VITE_MOCK_MONZO_ENABLED': JSON.stringify(rootEnv.VITE_MOCK_MONZO_ENABLED),
    }
  }
})