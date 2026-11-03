import { buildActivityType } from '@/schemas/__tests__/fixtures'
import { ActivityTypeSchema } from '../map-my-ride'

describe('ActivityTypeSchema', () => {
  it('refuses an activity the map has no layer for', () => {
    const result = ActivityTypeSchema.safeParse({
      ...buildActivityType(),
      name: 'Swimming',
    })

    expect(result.success).toBe(false)
  })
})
