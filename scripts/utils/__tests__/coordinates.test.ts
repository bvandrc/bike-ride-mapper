import type { Position } from 'geojson'

import { getMaxDistanceFeet, validatePointsDistance } from '../coordinates'

/**
 * Points along one line of latitude, so a step's length is only its longitude.
 *
 * At this latitude 0.001° of longitude is roughly 280 ft — near enough that a
 * case can pick limits either side of a gap without pinning turf's arithmetic.
 */
const STEP_FEET = 280
const at = (steps: number): Position => [-105 + steps * 0.001, 39.75]

describe('getMaxDistanceFeet', () => {
  it('finds the widest gap, and the point that closes it', () => {
    // The 4th point is three steps out, so the gap into it is the widest.
    const points = [at(0), at(1), at(2), at(5)]

    const { maxDistance, maxDistanceIndex } = getMaxDistanceFeet(points)

    expect(maxDistanceIndex).toBe(3)
    expect(maxDistance).toBeCloseTo(STEP_FEET * 3, -1)
  })

  it('refuses a route with nothing to measure between', () => {
    for (const points of [[], [at(0)]]) {
      expect(
        () => getMaxDistanceFeet(points),
        `${points.length} point(s)`
      ).toThrow('Not enough points')
    }
  })
})

describe('validatePointsDistance', () => {
  const LIMITS = { maxRouteDistanceFt: 1000, maxStartEndDistanceFt: 1000 }

  it('rejects a route that does not end back near where it started', () => {
    expect(() =>
      validatePointsDistance([at(0), at(1), at(10)], {
        ...LIMITS,
        maxStartEndDistanceFt: 500,
      })
    ).toThrow(
      /Start and End points are \d+ feet apart, exceeding limit of 500\./
    )
  })

  it('rejects a jump between two points, naming which pair and how far', () => {
    expect(() =>
      // Out and back, so the start/end check passes and only the jump fails.
      validatePointsDistance([at(0), at(10), at(0)], {
        ...LIMITS,
        maxRouteDistanceFt: 500,
      })
    ).toThrow(
      /Points 0 and 1 \(out of 3\) are \d+ feet apart, exceeding limit of 500\./
    )
  })

  it('checks the start and end before the gaps between points', () => {
    // Both limits are broken; the message says which check is worth fixing.
    expect(() =>
      validatePointsDistance([at(0), at(10)], {
        maxRouteDistanceFt: 100,
        maxStartEndDistanceFt: 100,
      })
    ).toThrow(/^Start and End/)
  })

  it('refuses an empty route rather than reading past the end of it', () => {
    expect(() => validatePointsDistance([], LIMITS)).toThrow(
      'No points provided'
    )
  })
})
