import { expect, type Page } from '@playwright/test'

import { SELECTORS } from '~/pw/support/constants/selectors'

const { HEADER } = SELECTORS

/** Waits until every route has streamed in and been drawn. */
export const waitForRoutes = async (page: Page) => {
  await expect(page.getByTestId(HEADER.STATS)).toBeVisible({ timeout: 15_000 })
  await expect(page.getByTestId(HEADER.LOADING)).toHaveCount(0)
}

/** Moves the pointer somewhere no route can be under it. */
export const leaveRoutes = async (page: Page) => {
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
export const getRoutePoint = async (page: Page) => {
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
