/**
 * @fileoverview Schemas for the MapMyRide API responses the scripts fetch.
 *
 * The types in `@/types/map-my-ride` are derived from these, so a field is
 * declared once and checked wherever a response comes in.
 */

import { z } from 'zod'

import { ActivityName } from '@/types/map-my-ride'

export const OAuthResponseSchema = z.object({
  access_token: z.string(),
  expires_in: z.number(),
  token_type: z.string(),
  scope: z.string(),
  refresh_token: z.string(),
})

export const LinkSchema = z.object({
  href: z.string(),
  id: z.string().optional(),
  name: z.string().optional(),
})

const LinksSchema = z.array(LinkSchema)

export const RouteSchema = z.object({
  city: z.string().nullable(),
  country: z.string().nullable(),
  state: z.string(),
  starting_location: z.object({
    type: z.string(),
    coordinates: z.array(z.number()),
  }),
  start_point_type: z.string(),
  postal_code: z.string(),
  distance: z.number(),
  name: z.string(),
  description: z.string(),
  data_source: z.string(),
  images: z.array(z.unknown()).optional(),
  created_datetime: z.string(),
  updated_datetime: z.string(),
  points: z.string().nullable(),
  climbs: z.string().nullable(),
  total_ascent: z.number(),
  total_descent: z.number(),
  min_elevation: z.number(),
  max_elevation: z.number(),
  _links: z.object({
    self: LinksSchema,
    documentation: LinksSchema,
    // `getRoutePathData` finds the GPX/KML download among these.
    alternate: LinksSchema,
    thumbnail: LinksSchema,
    privacy: LinksSchema.optional(),
    user: LinksSchema.optional(),
    activity_types: LinksSchema.optional(),
  }),
})

export const WorkoutSchema = z.object({
  name: z.string(),
  start_datetime: z.string(),
  start_locale_timezone: z.string(),
  created_datetime: z.string(),
  updated_datetime: z.string(),
  reference_key: z.string(),
  source: z.string(),
  attachments: z.record(z.string(), z.unknown()).optional(),
  sharing: z.record(z.string(), z.unknown()).optional(),
  notes: z.string(),
  aggregates: z.object({
    distance_total: z.number(),
    metabolic_energy_total: z.number().optional(),
    active_time_total: z.number(),
    elapsed_time_total: z.number(),
    steps_total: z.number().optional(),
    heartrate_min: z.number().optional(),
    heartrate_max: z.number().optional(),
    heartrate_avg: z.number().optional(),
    speed_min: z.number().optional(),
    speed_max: z.number().optional(),
    speed_avg: z.number().optional(),
    cadence_min: z.number().optional(),
    cadence_max: z.number().optional(),
    cadence_avg: z.number().optional(),
    power_min: z.number().optional(),
    power_max: z.number().optional(),
    power_avg: z.number().optional(),
  }),
  has_time_series: z.boolean(),
  time_series: z.record(z.string(), z.unknown()).optional(),
  activity_type: z.string().optional(),
  _links: z.object({
    self: LinksSchema,
    user: LinksSchema,
    // `getActivityType` and `getRoute` follow the first link of each.
    activity_type: LinksSchema.nonempty(),
    route: LinksSchema.nonempty(),
    privacy: LinksSchema,
    documentation: LinksSchema.optional(),
    alternate: LinksSchema.optional(),
    thumbnail: LinksSchema.optional(),
    workout_attribution: LinksSchema.optional(),
  }),
})

export const ActivityTypeSchema = z.object({
  name: z.enum(ActivityName),
  short_name: z.string().nullable(),
  location_aware: z.boolean(),
  import_only: z.boolean(),
  mets: z.number(),
  // The API sends each speed band's `mets` as a numeric string.
  mets_speed: z.array(z.object({ speed: z.number(), mets: z.string() })),
  _links: z.object({
    self: LinksSchema,
    documentation: LinksSchema,
    root: LinksSchema,
    icon_url: LinksSchema,
    parent: LinksSchema.optional(),
  }),
})
