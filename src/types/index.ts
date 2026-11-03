import type { z } from 'zod'

import type { CustomWorkoutSchema } from '@/schemas/custom-workout'

export type CustomWorkout = z.infer<typeof CustomWorkoutSchema>

export interface NdJsonMeta {
  _meta?: { total: number }
}
