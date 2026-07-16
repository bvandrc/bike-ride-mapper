import { expect } from '@playwright/test'
import { lighthouseTest as test } from './fixtures'

test('Home page', async ({ page, runAudit }) => {
  await page.goto('/')

  await runAudit({ name: 'initial' })

  // workout routes stream in and populate the header stats
  await expect(page.getByText(/# Routes: \d+/)).toBeVisible({
    timeout: 15_000,
  })

  await runAudit({ name: 'loaded' })
})
