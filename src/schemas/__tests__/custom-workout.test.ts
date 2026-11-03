import { buildCustomWorkoutInput } from '@/schemas/__tests__/fixtures'
import { CustomWorkoutSchema } from '../custom-workout'

describe('CustomWorkoutSchema', () => {
  it('keeps the ride and drops the API fields it has no use for', () => {
    const INPUT = buildCustomWorkoutInput()

    const workout = CustomWorkoutSchema.parse(INPUT)

    expect(workout).toMatchObject({
      title: INPUT.title,
      geoJson: INPUT.geoJson,
      activityType: { name: INPUT.activityType.name },
    })
    for (const [part, field] of [
      ['workout', '_links'],
      ['route', '_links'],
      ['activityType', '_links'],
      ['activityType', 'mets_speed'],
    ] as const) {
      expect(workout[part], `${part}.${field}`).not.toHaveProperty(field)
    }
  })

  it('refuses a geoJson that is not a FeatureCollection of at least one feature', () => {
    const INPUT = buildCustomWorkoutInput()

    for (const geoJson of [
      // A lone feature, rather than a collection of them.
      INPUT.geoJson.features[0],
      // A collection with nothing in it to draw.
      { ...INPUT.geoJson, features: [] },
      null,
    ]) {
      const result = CustomWorkoutSchema.safeParse({ ...INPUT, geoJson })

      expect(result.success, JSON.stringify(geoJson)).toBe(false)
    }
  })
})
