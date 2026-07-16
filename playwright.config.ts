import { defineConfig, devices } from '@playwright/test'

const RESULTS_FOLDER = 'playwright/results'

const PORT = process.env.PORT || 4173 // vite preview default port
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`

export default defineConfig({
  testDir: './playwright',
  outputDir: `${RESULTS_FOLDER}/artifacts`,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: [
    ['list'],
    [
      'html',
      {
        outputFolder: `${RESULTS_FOLDER}/html`,
        open: process.env.CI ? 'never' : 'on-failure',
      },
    ],
  ],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'e2e',
      testMatch: /e2e\/.*\.spec\.ts/,
      use: devices['Desktop Chrome'],
    },
  ],
})
