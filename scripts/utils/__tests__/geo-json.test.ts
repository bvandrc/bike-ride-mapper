import type { FeatureCollection, LineString, Position } from 'geojson'

import { simplifyGeoJson } from '../geo-json'

/** A wandering line, so simplification has redundant points to drop. */
const WANDERING_LINE: Position[] = Array.from({ length: 50 }, (_, i) => [
  -105 + i * 0.0001,
  39.75 + (i % 2) * 0.000_01,
])

const buildLineCollection = (...lines: Position[][]): FeatureCollection => ({
  type: 'FeatureCollection',
  features: lines.map((coordinates) => ({
    type: 'Feature',
    properties: {},
    geometry: { type: 'LineString', coordinates } satisfies LineString,
  })),
})

const getPointCount = (collection: FeatureCollection) =>
  (collection.features[0].geometry as LineString).coordinates.length

describe('simplifyGeoJson', () => {
  it('reports the point count either side of the simplification', () => {
    const result = simplifyGeoJson(buildLineCollection(WANDERING_LINE), {
      tolerance: 0.001,
    })

    expect(result).toMatchObject({
      numPointsUnsimplified: WANDERING_LINE.length,
      numPointsSimplified: getPointCount(result.geoJsonSimplified),
    })
    // Simplification actually dropped points.
    expect(result.numPointsSimplified).toBeLessThan(WANDERING_LINE.length)
  })

  it('refuses a collection that is not one route', () => {
    for (const collection of [
      buildLineCollection(),
      buildLineCollection(WANDERING_LINE, WANDERING_LINE),
    ]) {
      expect(
        () => simplifyGeoJson(collection, { tolerance: 0.001 }),
        `${collection.features.length} feature(s)`
      ).toThrow('more than 1 geoJson feature?')
    }
  })
})
