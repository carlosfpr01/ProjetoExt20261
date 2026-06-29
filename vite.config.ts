import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const defaultBackendApiTarget = 'https://fantastic-potato-r4gpqxjj7v693x59g-8080.app.github.dev'
const backendApiTarget = process.env.BASE_URL ?? defaultBackendApiTarget
const defaultBackendS3Target = 'https://fantastic-potato-r4gpqxjj7v693x59g-4566.app.github.dev'
const backendS3Target = process.env.S3_BASE_URL ?? defaultBackendS3Target

export default defineConfig({
  base: '/ProjetoExt20261/',
  server: {
    proxy: {
      '/api': {
        target: backendApiTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (requestPath) => requestPath.replace(/^\/api/, ''),
      },
      '/s3': {
        target: backendS3Target,
        changeOrigin: true,
        secure: false,
        rewrite: (requestPath) => requestPath.replace(/^\/s3/, ''),
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
