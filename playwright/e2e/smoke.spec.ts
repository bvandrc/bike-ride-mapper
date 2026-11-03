import { expect, test } from '@playwright/test'

import { SELECTORS } from '~/pw/support/constants/selectors'

const { HEADER, MAP } = SELECTORS

test('home page loads', async ({ page }) => {
  await page.goto('/')

  await expect(page).toHaveTitle('My Bike Ride Map')
  await expect(
    page.getByRole('heading', { name: 'My Bike Rides' })
  ).toBeVisible()
  await expect(page.getByText('Bike Records')).toBeVisible()

  // workout routes stream in and populate the header stats
  await expect(page.getByTestId(HEADER.STATS)).toBeVisible({
    timeout: 15_000,
  })

  await expect(page.locator(MAP.ROUTE).first()).toBeAttached({
    timeout: 15_000,
  })
})
