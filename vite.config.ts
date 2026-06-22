import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const defaultBackendApiTarget = 'https://fantastic-potato-r4gpqxjj7v693x59g-8080.app.github.dev'
const backendApiTarget = process.env.VITE_API_BASE_URL ?? defaultBackendApiTarget

export default defineConfig({
  base: '/ProjetoExt20261/',
  define: {
    'import.meta.env.VITE_API_BASE_URL': JSON.stringify(backendApiTarget),
  },
  server: {
    proxy: {
      '/api': {
        target: backendApiTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
