import { expect, test } from '@playwright/test'

import { SELECTORS } from '../support/constants/selectors'
import { checkA11y } from './accessibility'

// One "workflow" test: the page with routes loaded, then with a route
// layer toggled off — scanned once each.
test('Home page', async ({ page }) => {
  await page.goto('/')

  // workout routes stream in and populate the header stats
  await expect(page.locator(SELECTORS.HEADER.STATS)).toBeVisible({
    timeout: 15_000,
  })
  await checkA11y(page)

  await expect(page.locator(SELECTORS.MAP.ROUTE).first()).toBeAttached({
    timeout: 15_000,
  })
  await checkA11y(page)

  await test.step('Toggled route layer', async () => {
    const walkLayerToggle = page.getByRole('checkbox', {
      name: 'Walk Records',
    })
    await walkLayerToggle.uncheck()
    await expect(walkLayerToggle).not.toBeChecked()
    await checkA11y(page)
  })
})
