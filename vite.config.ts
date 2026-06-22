import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const DEFAULT_BASE_PATH = '/ProjetoExt20261/'

const normalizeBase = (basePath?: string) => {
  if (!basePath) {
    return '/'
  }

  const trimmedBase = basePath.trim()

  if (!trimmedBase || trimmedBase === '/') {
    return '/'
  }

  return `/${trimmedBase.replace(/^\/+|\/+$/g, '')}/`
}

export default defineConfig({
  base: normalizeBase(process.env.URL_BASE ?? DEFAULT_BASE_PATH),
  server: {
    proxy: {
      '/api': {
        target: 'https://fantastic-potato-r4gpqxjj7v693x59g-8080.app.github.dev',
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
