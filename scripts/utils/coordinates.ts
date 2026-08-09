import { distance } from '@turf/distance'
import type { Position } from 'geojson'

/** GeoJSON coordinate order: `[longitude, latitude]`. */
export type Point = Position

/** Great-circle distance, in feet. */
export function getDistanceFeet(from: Point, to: Point): number {
  return distance(from, to, { units: 'feet' })
}

export function getMaxDistanceFeet(points: Point[]) {
  if (points.length < 2) {
    throw new Error('Not enough points')
  }

  let maxDistance = 0
  let maxDistanceIndex = -1

  for (let i = 1; i < points.length; i++) {
    const distanceFeet = getDistanceFeet(points[i - 1], points[i])
    if (distanceFeet > maxDistance) {
      maxDistance = distanceFeet
      maxDistanceIndex = i
    }
  }

  return { maxDistance, maxDistanceIndex }
}

export function validatePointsDistance(
  points: Point[],
  {
    maxRouteDistanceFt,
    maxStartEndDistanceFt,
  }: { maxRouteDistanceFt: number; maxStartEndDistanceFt: number },
) {
  const lastPoint = points.at(-1)
  if (!lastPoint) {
    throw new Error('No points provided')
  }
  const startEndDistanceFt = getDistanceFeet(points[0], lastPoint)
  if (startEndDistanceFt > maxStartEndDistanceFt) {
    throw new Error(
      `Start and End points are ${startEndDistanceFt.toFixed(0)} feet apart, exceeding limit of ${maxStartEndDistanceFt}.`,
    )
  }

  const { maxDistance, maxDistanceIndex } = getMaxDistanceFeet(points)
  if (maxDistance > maxRouteDistanceFt) {
    throw new Error(
      `Points ${maxDistanceIndex - 1} and ${maxDistanceIndex} (out of ${points.length}) are ${maxDistance.toFixed(0)} feet apart, exceeding limit of ${maxRouteDistanceFt}.`,
    )
  }
}
