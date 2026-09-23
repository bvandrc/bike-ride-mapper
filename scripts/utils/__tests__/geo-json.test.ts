import type { FeatureCollection, LineString, Position } from 'geojson'

import { simplifyGeoJson } from '../geo-json'

/** A wandering line, so simplification has redundant points to drop. */
const WANDERING_LINE: Position[] = Array.from({ length: 50 }, (_, i) => [
  -105 + i * 0.0001,
  39.75 + (i % 2) * 0.000_01,
])

const lineCollection = (...lines: Position[][]): FeatureCollection => ({
  type: 'FeatureCollection',
  features: lines.map((coordinates) => ({
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates } satisfies LineString,
  })),
})

const pointCount = (collection: FeatureCollection) =>
  (collection.features[0].geometry as LineString).coordinates.length

describe('simplifyGeoJson', () => {
  it('reports the point count either side of the simplification', () => {
    const { geoJsonSimplified, numPointsUnsimplified, numPointsSimplified } =
      simplifyGeoJson(lineCollection(WANDERING_LINE), { tolerance: 0.001 })

    expect(numPointsUnsimplified).toBe(WANDERING_LINE.length)
    expect(numPointsSimplified).toBe(pointCount(geoJsonSimplified))
    expect(numPointsSimplified).toBeLessThan(numPointsUnsimplified)
  })

  it('leaves a line alone when the tolerance is too fine to drop anything', () => {
    const { numPointsSimplified, numPointsUnsimplified } = simplifyGeoJson(
      lineCollection(WANDERING_LINE),
      { tolerance: 0 }
    )

    expect(numPointsSimplified).toBe(numPointsUnsimplified)
  })

  it('refuses a collection that is not one route', () => {
    for (const collection of [
      lineCollection(),
      lineCollection(WANDERING_LINE, WANDERING_LINE),
    ]) {
      expect(
        () => simplifyGeoJson(collection, { tolerance: 0.001 }),
        `${collection.features.length} feature(s)`
      ).toThrow('more than 1 geoJson feature?')
    }
  })
})
