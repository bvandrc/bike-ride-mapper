import { expect } from '@playwright/test'
import { desktopConfig } from 'lighthouse'
import { lighthouseTest as test } from './fixtures'

test('Home page', async ({ page, runAudit }) => {
  await page.goto('/')

  await test.step('initial', async () => {
    await runAudit({
      name: 'initial-desktop',
      lighthouseArgs: { config: desktopConfig },
    })
    await runAudit({ name: 'initial-mobile' })
  })

  // workout routes stream in and populate the header stats
  await expect(page.getByText(/# Routes: \d+/)).toBeVisible({
    timeout: 15_000,
  })

  await test.step('loaded', async () => {
    await runAudit({
      name: 'loaded-desktop',
      lighthouseArgs: { config: desktopConfig },
    })
    await runAudit({ name: 'loaded-mobile' })
  })
})
