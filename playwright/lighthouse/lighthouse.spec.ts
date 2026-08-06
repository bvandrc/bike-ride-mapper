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

  // workout routes stream in and populate the header stats; on production the
  // real network (plus lingering throttling from the mobile audit) can be much
  // slower than the local preview server, so give it more room than 15s.
  await expect(page.getByText(/# Routes: \d+/)).toBeVisible({
    timeout: 60_000,
  })

  await test.step('loaded', async () => {
    await runAudit({
      name: 'loaded-desktop',
      lighthouseArgs: { config: desktopConfig },
    })
    await runAudit({ name: 'loaded-mobile' })
  })
})
