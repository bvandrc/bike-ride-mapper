import { expect, test } from '@playwright/test'

import { SELECTORS } from '~/pw/support/constants/selectors'
import {
  getRoutePoint,
  leaveRoutes,
  waitForRoutes,
} from '~/pw/support/helpers/map'

const { MAP } = SELECTORS

test('hovering a route shows its tooltip until the pointer leaves', async ({
  page,
}) => {
  await page.goto('/')
  const { x, y } = await getRoutePoint(page)
  const tooltip = page.locator(MAP.ROUTE_TOOLTIP)

  await page.mouse.move(x, y)
  await expect(tooltip).toHaveCount(1)
  await expect(tooltip).toContainText('Distance:')

  await leaveRoutes(page)
  await expect(tooltip).toHaveCount(0)
})

// Leaflet defers a tooltip hovered mid-drag until the drag ends, then opens it
// wherever the pointer has gone, where nothing would close it again.
test('dragging the map across routes leaves no tooltip open', async ({
  page,
}) => {
  await page.goto('/')
  await waitForRoutes(page)
  const { width, height } = page.viewportSize() ?? { width: 0, height: 0 }

  // The map only catches up to the pointer once a frame, so a quick drag
  // through the dense middle of the map passes the pointer over routes.
  await page.mouse.move(width * 0.25, height * 0.8)
  await page.mouse.down()
  await page.mouse.move(width * 0.8, height * 0.4, { steps: 40 })
  await page.mouse.up()
  await leaveRoutes(page)

  // Give a deferred open its chance to fire before asserting it didn't.
  await page.waitForTimeout(500)
  await expect(page.locator(MAP.ROUTE_TOOLTIP)).toHaveCount(0)
})
