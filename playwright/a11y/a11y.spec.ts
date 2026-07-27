import { expect, test } from '@playwright/test'
import { checkA11y } from '../support/accessibility'

// One "workflow" test: the page with routes loaded, then with a route
// layer toggled off — scanned once each.
test('Home page', async ({ page }) => {
  await page.goto('/')

  // workout routes stream in and populate the header stats
  await expect(page.getByText(/# Routes: \d+/)).toBeVisible({
    timeout: 15_000,
  })
  await checkA11y(page)

  await expect(page.locator('.leaflet-interactive')).toBeAttached({
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
