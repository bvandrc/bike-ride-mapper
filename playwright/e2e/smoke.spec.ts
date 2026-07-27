import { expect, test } from '@playwright/test'

test('home page loads', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('My Bike Ride Map')
  await expect(
    page.getByRole('heading', { name: 'My Bike Rides' }),
  ).toBeVisible()
  await expect(page.getByText('Bike Records')).toBeVisible()

  // workout routes stream in and populate the header stats
  await expect(page.getByText(/# Routes: \d+/)).toBeVisible({
    timeout: 15_000,
  })

  await expect(page.locator('.leaflet-interactive')).toBeAttached({
    timeout: 15_000,
  })
})
