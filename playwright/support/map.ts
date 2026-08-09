import type { Page } from '@playwright/test'
import { SELECTORS } from './constants'

/** Approach distance, in px, so Leaflet sees the pointer enter the route. */
const APPROACH_OFFSET = 40

/**
 * Viewport coordinates of a point lying on a rendered route's stroke — route
 * paths are thin and curved, so an element's bounding-box centre usually misses.
 */
export async function getPointOnRoute(page: Page) {
  const point = await page.evaluate((selector) => {
    const paths = document.querySelectorAll<SVGPathElement>(
      `#map svg path${selector}`,
    )
    for (const path of paths) {
      const matrix = path.getScreenCTM()
      if (!matrix) continue
      const length = path.getTotalLength()
      for (let fraction = 0.1; fraction < 1; fraction += 0.1) {
        const { x, y } = path.getPointAtLength(length * fraction)
        const viewportX = x * matrix.a + y * matrix.c + matrix.e
        const viewportY = x * matrix.b + y * matrix.d + matrix.f
        // keep clear of the header and the layers control
        if (
          viewportX > 60 &&
          viewportY > 140 &&
          viewportX < window.innerWidth - 60 &&
          viewportY < window.innerHeight - 60
        ) {
          return { x: viewportX, y: viewportY }
        }
      }
    }
    return null
  }, SELECTORS.LEAFLET_INTERACTIVE)

  if (!point) throw new Error('No route path is visible in the viewport')
  return point
}

/** Moves the pointer onto a rendered route, entering it from off the line. */
export async function hoverRoute(page: Page) {
  const { x, y } = await getPointOnRoute(page)
  await page.mouse.move(x - APPROACH_OFFSET, y - APPROACH_OFFSET)
  await page.mouse.move(x, y, { steps: 12 })
}

/**
 * Moves the pointer to bare map. Routes blanket the viewport, so the corners
 * aren't reliably empty — the point has to be searched for.
 */
export async function moveOffRoutes(page: Page) {
  const point = await page.evaluate(() => {
    for (let x = 100; x < window.innerWidth - 100; x += 17) {
      for (let y = 200; y < window.innerHeight - 100; y += 17) {
        if (document.elementFromPoint(x, y)?.tagName !== 'path') return { x, y }
      }
    }
    return null
  })

  if (!point) throw new Error('No empty map point is visible in the viewport')
  await page.mouse.move(point.x, point.y, { steps: 20 })
}
