import { expect, test } from '@playwright/test'
import { SELECTORS } from '../support/constants'
import { hoverRoute, moveOffRoutes } from '../support/map'

test('home page loads', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('My Bike Ride Map')
  await expect(
    page.getByRole('heading', { name: 'My Bike Rides' }),
  ).toBeVisible()
  await expect(page.getByText('Bike Records')).toBeVisible()

  // workout routes stream in and populate the header stats
  await expect(page.getByText(SELECTORS.ROUTES_COUNT_TEXT)).toBeVisible({
    timeout: 15_000,
  })

  await expect(
    page.locator(SELECTORS.LEAFLET_INTERACTIVE).first(),
  ).toBeAttached({
    timeout: 15_000,
  })
})

test('hovering a route shows its details', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText(SELECTORS.LOADING_TEXT)).toHaveCount(0, {
    timeout: 20_000,
  })

  const tooltip = page.locator(SELECTORS.LEAFLET_TOOLTIP)

  // routes keep re-rendering as they stream in, so re-aim if the pointer misses
  await expect(async () => {
    await hoverRoute(page)
    await expect(tooltip).toHaveText(SELECTORS.ROUTE_TOOLTIP_TEXT, {
      timeout: 2000,
    })
  }).toPass({ timeout: 20_000 })

  await moveOffRoutes(page)
  await expect(tooltip).toHaveCount(0)
})
