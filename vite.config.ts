import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { pick } from 'es-toolkit'
import { defineConfig, loadEnv } from 'vite'

/**
 * The only build-time variables inlined into the client bundle.
 */
/**
 * We have other env vars for getting data in GH workflows, but those
 * should be excluded from client bundle.
 */
const CLIENT_ENV_KEYS = ['MAPTILER_API_KEY'] as const

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    base: '/bike-ride-mapper/',
    define: {
      'process.env': JSON.stringify(pick(env, CLIENT_ENV_KEYS)),
    },
    plugins: [tailwindcss(), react()],
    build: {
      target: 'esnext',
      modulePreload: false,
    },
  }
})
