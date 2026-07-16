import { defineConfig, devices, type Project } from '@playwright/test'

const RESULTS_FOLDER = 'playwright/results'

const PORT = process.env.PORT || 4173 // vite preview default port
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`

const E2E_TEST_REGEX = /e2e\/.*\.spec\.ts/
const A11Y_TEST_REGEX = /a11y\/.*\.spec\.ts/

const getProject = ({
  mobile,
  ...project
}: Project & { mobile?: boolean }): Project => ({
  ...project,
  use: mobile ? devices['Pixel 7'] : devices['Desktop Chrome'],
})

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
    getProject({ name: 'e2e', testMatch: E2E_TEST_REGEX }),
    getProject({ name: 'a11y', testMatch: A11Y_TEST_REGEX }),
    getProject({
      name: 'a11y:mobile',
      testMatch: A11Y_TEST_REGEX,
      mobile: true,
    }),
  ],
})
