/**
 * @fileoverview Schema for one ride as `pnpm get-data` writes it to
 * `workouts/` and `pnpm build:workouts` rolls it into the NDJSON.
 */

import { isPlainObject } from 'es-toolkit'
import type { FeatureCollection } from 'geojson'
import { z } from 'zod'

import { ActivityTypeSchema, RouteSchema, WorkoutSchema } from './map-my-ride'

/**
 * A GeoJSON `FeatureCollection` with at least one feature.
 *
 * Shallow on purpose: walking every coordinate of every ride costs far more
 * than it catches.
 */
const FeatureCollectionSchema = z.custom<FeatureCollection>(
  (value) =>
    isPlainObject(value) &&
    value.type === 'FeatureCollection' &&
    Array.isArray(value.features) &&
    value.features.length > 0,
  { message: 'Expected a GeoJSON FeatureCollection with at least one feature' }
)

export const CustomWorkoutSchema = z.object({
  title: z.string(),
  pathHasIssue: z.boolean().optional(),
  geoJson: FeatureCollectionSchema,
  workout: WorkoutSchema.omit({
    _links: true,
    time_series: true,
    sharing: true,
    attachments: true,
  }),
  route: RouteSchema.omit({ _links: true }),
  activityType: ActivityTypeSchema.omit({ _links: true, mets_speed: true }),
})
