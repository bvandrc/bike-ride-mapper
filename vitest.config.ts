import { resolve } from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // The app's own `@/*` alias, which vite.config.ts sets for the build.
    alias: { '@': resolve(import.meta.dirname, 'src') },
  },
  test: {
    // A spy declared once for a `describe` starts each case empty, so a
    // `toHaveBeenCalledWith` cannot pass on a call from the case before it.
    clearMocks: true,
    environment: 'happy-dom',
    globals: true,
    watch: false,
    root: '.',
    include: ['./{src,scripts}/**/*.{test,spec}.*'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/playwright/**'],
    coverage: {
      exclude: [
        '**/__*__/**',
        '**/types/**',
        '**/dist/**',
        '**/playwright/**',
        '**/*.d.ts',
        '*.config.ts',
      ],
      reporter: ['text', 'html', 'json', 'lcov'],
    },
  },
})
