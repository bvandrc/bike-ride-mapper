import { expect, type Page, test } from '@playwright/test'

import { SELECTORS } from '~/pw/support/constants/selectors'

const { HEADER, MAP } = SELECTORS

const waitForRoutes = async (page: Page) => {
  await expect(page.getByTestId(HEADER.STATS)).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId(HEADER.LOADING)).toHaveCount(0)
}

/** Moves the pointer somewhere no route can be under it. */
const leaveRoutes = async (page: Page) => {
  // Leaflet's layer control floats over the map; it's Leaflet's markup, with
  // no testid to reach it by.
  await page.getByText('Bike Records').hover()
}

/** How far `getRoutePoint` keeps from the viewport's edges, in pixels. */
const EDGE_MARGIN = 250

/**
 * Viewport point on a route that nothing covers, once every route has loaded.
 *
 * The point sits on the route's hover target, the invisible wide line Leaflet
 * sends pointer events to, and at least `EDGE_MARGIN` from the viewport edges.
 */
const getRoutePoint = async (page: Page) => {
  await waitForRoutes(page)
  return page.evaluate((margin) => {
    const targets = [
      ...document.querySelectorAll<SVGPathElement>('path.leaflet-interactive'),
    ].filter((path) => path.getAttribute('stroke-opacity') === '0')
    for (const target of targets) {
      const length = target.getTotalLength()
      for (let step = 1; step < 10; step++) {
        // Later routes draw over earlier ones, so check this one is on top.
        const { x, y } = target
          .getPointAtLength((length * step) / 10)
          .matrixTransform(target.getScreenCTM() ?? undefined)
        const isInside =
          x > margin &&
          x < window.innerWidth - margin &&
          y > margin &&
          y < window.innerHeight - margin
        if (isInside && document.elementFromPoint(x, y) === target)
          return { x, y }
      }
    }
    throw new Error('no uncovered route point in the viewport')
  }, EDGE_MARGIN)
}

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
