import { defineConfig, devices, type Project } from '@playwright/test'

const RESULTS_FOLDER = 'playwright/results'

const PORT = process.env.PORT || 4173 // vite preview default port
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`

const E2E_TEST_REGEX = /e2e\/.*\.spec\.ts/
const A11Y_TEST_REGEX = /a11y\/.*\.spec\.ts/
const LIGHTHOUSE_TEST_REGEX = /lighthouse\/.*\.spec\.ts/

// No device config: the lighthouse fixtures launch their own persistent context.
const LIGHTHOUSE_PROJECT = {
  testMatch: LIGHTHOUSE_TEST_REGEX,
  fullyParallel: false,
  workers: 1, // a concurrent audit would skew the timings being measured
  // each test runs a full desktop + mobile audit
  timeout: 5 * 60_000,
} satisfies Partial<Project>

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
  // Playwright defaults to half the cores, which is 1 worker on CI's 2-core
  // runner -- so every project ran serially there despite `fullyParallel`.
  workers: process.env.CI ? '100%' : undefined,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [
    ['list', { printSteps: true }],
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
    {
      ...LIGHTHOUSE_PROJECT,
      name: 'lighthouse',
    },
    {
      // audits the deployed site instead of the local preview server
      ...LIGHTHOUSE_PROJECT,
      name: 'lighthouse:production',
      use: { baseURL: 'https://bvandrc.github.io/bike-ride-mapper/' },
    },
  ],
})
