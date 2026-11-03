/**
 * @fileoverview MapMyRide responses shaped like the API's, for the schema tests.
 */

import type { FeatureCollection } from 'geojson'

import type { CustomWorkout } from '@/types'
import {
  ActivityName,
  type ActivityType,
  type Route,
  type Workout,
} from '@/types/map-my-ride'

const buildLinks = (href: string) => [{ href, id: '1' }]

export const buildWorkout = (): Workout => ({
  name: 'Morning Ride',
  start_datetime: '2024-01-03T21:30:00+00:00',
  start_locale_timezone: 'America/Denver',
  created_datetime: '2024-01-05T09:03:10+00:00',
  updated_datetime: '2024-01-25T06:31:31+00:00',
  reference_key: 'ref-1',
  source: 'MapMyFitness Web',
  notes: '',
  aggregates: {
    distance_total: 28_485,
    active_time_total: 9000,
    elapsed_time_total: 9000,
  },
  has_time_series: false,
  _links: {
    self: buildLinks('/v7.2/workout/1/'),
    user: buildLinks('/v7.2/user/1/'),
    activity_type: [{ href: '/v7.2/activity_type/11/', id: '11' }],
    route: [{ href: '/v7.2/route/1/', id: '1' }],
    privacy: buildLinks('/v7.2/privacy_option/1/'),
  },
})

export const buildRoute = (): Route => ({
  city: 'Denver',
  country: 'us',
  state: 'CO',
  starting_location: { type: 'Point', coordinates: [-104.98, 39.73] },
  start_point_type: '',
  postal_code: '',
  distance: 28_533,
  name: 'Morning Ride',
  description: '',
  data_source: 'run:RE',
  images: [],
  created_datetime: '2024-01-05T09:01:09+00:00',
  updated_datetime: '2024-01-05T09:01:16+00:00',
  points: null,
  climbs: null,
  total_ascent: 176.9,
  total_descent: -176,
  min_elevation: 1585.7,
  max_elevation: 1709.73,
  _links: {
    self: buildLinks('/v7.2/route/1/'),
    documentation: buildLinks('/docs/route/'),
    alternate: [{ href: '/v7.2/route/1/?format=gpx', name: 'gpx' }],
    thumbnail: buildLinks('/thumbnail/1'),
  },
})

export const buildActivityType = (): ActivityType => ({
  name: ActivityName.BIKE_RIDE,
  short_name: 'ride',
  location_aware: true,
  import_only: false,
  mets: 8,
  mets_speed: [{ speed: 4.4704, mets: '4' }],
  _links: {
    self: buildLinks('/v7.2/activity_type/11/'),
    documentation: buildLinks('/docs/activity_type/'),
    root: buildLinks('/v7.2/activity_type/9/'),
    icon_url: buildLinks('/icons/ride.png'),
  },
})

export const buildFeatureCollection = (): FeatureCollection => ({
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [-104.98, 39.73],
          [-104.99, 39.74],
        ],
      },
    },
  ],
})

/** A ride as `get-data` assembles it, still carrying the API's `_links`. */
export const buildCustomWorkoutInput = () =>
  ({
    title: '2024-01-03 Morning Ride',
    pathHasIssue: false,
    geoJson: buildFeatureCollection(),
    workout: buildWorkout(),
    route: buildRoute(),
    activityType: buildActivityType(),
  }) satisfies CustomWorkout
