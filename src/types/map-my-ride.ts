import type { z } from 'zod'

import type {
  ActivityTypeSchema,
  LinkSchema,
  OAuthResponseSchema,
  RouteSchema,
  WorkoutSchema,
} from '@/schemas/map-my-ride'

export type OAuthResponse = z.infer<typeof OAuthResponseSchema>
export type Link = z.infer<typeof LinkSchema>
export type Route = z.infer<typeof RouteSchema>
export type Workout = z.infer<typeof WorkoutSchema>
export type ActivityType = z.infer<typeof ActivityTypeSchema>

// Kept out of the schema module so the app can import it without bundling zod.
export enum ActivityName {
  ROAD_CYCLING = 'Road Cycling',
  BIKE_RIDE = 'Bike Ride',
  WALK = 'Walk',
  RUN = 'Run',
}
