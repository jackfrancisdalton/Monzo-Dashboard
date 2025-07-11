import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  
  /**
   * If development we load the env variables from the .env file in the turbo repo
   * Else we use the variables provided via the Docker environment variables
   * 
   * Done as the turbo repo context is not available in the Docker container
   */
  const env = mode === 'development' 
    ? loadEnv(mode, path.resolve(__dirname, '../../'), 'VITE_') 
    : process.env;

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    // TODO: review this approach to env variables and ensure no others are loaded
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(env.VITE_API_URL),
      'import.meta.env.VITE_FRONTEND_URL': JSON.stringify(env.VITE_FRONTEND_URL),
      'import.meta.env.VITE_MOCK_MONZO_URL': JSON.stringify(env.VITE_MOCK_MONZO_URL),
    }
  }
})