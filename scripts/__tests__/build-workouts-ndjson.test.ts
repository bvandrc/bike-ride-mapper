import { omit } from 'es-toolkit'
import { vol } from 'memfs'

import type { CustomWorkout, NdJsonMeta } from '@/types'
import { ActivityName } from '@/types/map-my-ride'

vi.mock('node:fs', async () => {
  const { fs } = await import('memfs')
  return { ...fs, default: fs }
})

const PROJECT = '/project'
const OUT_FILE = `${PROJECT}/public/workouts.ndjson`

/** A workout complete enough for the map, which the script keeps. */
const WORKOUT = {
  title: 'A ride',
  geoJson: { type: 'FeatureCollection' },
  workout: {
    name: 'A ride',
    start_datetime: '2024-01-03T21:30:00+00:00',
    start_locale_timezone: 'America/Denver',
    created_datetime: '2024-01-05T09:03:10+00:00',
    updated_datetime: '2024-01-05T09:03:10+00:00',
    reference_key: 'a-ride',
    source: 'MapMyFitness Web',
    notes: '',
    aggregates: {
      distance_total: 28_485,
      metabolic_energy_total: 4_581_480,
      active_time_total: 9000,
      elapsed_time_total: 9000,
      steps_total: 0,
      speed_avg: 3.17,
    },
    has_time_series: false,
  },
  route: {
    city: 'Denver',
    country: 'us',
    state: 'CO',
    starting_location: { type: 'Point', coordinates: [-104.98, 39.73] },
    start_point_type: '',
    postal_code: '',
    distance: 28_533,
    name: 'A route',
    description: '',
    data_source: 'run:RE',
    created_datetime: '2024-01-05T09:01:09+00:00',
    updated_datetime: '2024-01-05T09:01:16+00:00',
    points: null,
    climbs: null,
    total_ascent: 176.9,
    total_descent: -176,
    min_elevation: 1585.7,
    max_elevation: 1709.73,
  },
  activityType: {
    name: ActivityName.BIKE_RIDE,
    short_name: 'ride',
    location_aware: true,
    import_only: false,
    mets: 8,
  },
} satisfies CustomWorkout

/** The fields the map can't draw a workout without. */
const REQUIRED_FIELDS = [
  'geoJson',
  'workout',
  'route',
  'activityType',
] as const satisfies (keyof CustomWorkout)[]

/** Writes the workouts to the fake `workouts/` folder and runs the script, returning what it wrote. */
const runScript = async (workouts: Record<string, CustomWorkout>) => {
  vol.reset()
  vol.fromJSON(
    Object.fromEntries(
      Object.entries(workouts).map(([name, data]) => [
        `${PROJECT}/workouts/${name}`,
        JSON.stringify(data),
      ])
    ),
    PROJECT
  )
  // The script does its work on import, so each run needs a fresh module.
  vi.resetModules()
  await import('../build-workouts-ndjson')

  const written = vol.readFileSync(OUT_FILE, 'utf8') as string
  const [meta, ...rows] = written.trimEnd().split('\n')
  return {
    meta: JSON.parse(meta) as NdJsonMeta,
    rows: rows.map((row) => JSON.parse(row) as CustomWorkout),
  }
}

describe('build-workouts-ndjson', () => {
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue(PROJECT)
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  it('heads the file with the total, then one workout per line', async () => {
    const { meta, rows } = await runScript({
      'a.json': WORKOUT,
      'b.json': WORKOUT,
    })

    expect(meta).toEqual({ _meta: { total: 2 } })
    expect(rows).toEqual([WORKOUT, WORKOUT])
  })

  it('counts what it wrote, not what it read', async () => {
    const { meta, rows } = await runScript({
      'kept.json': WORKOUT,
      'flagged.json': { ...WORKOUT, pathHasIssue: true },
    })

    expect(meta).toEqual({ _meta: { total: 1 } })
    expect(rows).toEqual([WORKOUT])
  })

  it('leaves out a workout whose path is flagged as wrong', async () => {
    const { rows } = await runScript({
      'flagged.json': { ...WORKOUT, pathHasIssue: true },
    })

    expect(rows).toEqual([])
  })

  it('leaves out a workout missing a field the map needs', async () => {
    for (const field of REQUIRED_FIELDS) {
      const { rows } = await runScript({
        // @ts-expect-error -- a file on disk can lack what the type promises,
        // which is what the script guards against.
        'incomplete.json': omit(WORKOUT, [field]),
      })

      expect(rows, field).toEqual([])
    }
  })

  it('writes a file with a zero total rather than none at all', async () => {
    // The app fetches this path either way, so an absent file is a 404.
    const { meta, rows } = await runScript({})

    expect(meta).toEqual({ _meta: { total: 0 } })
    expect(rows).toEqual([])
  })
})
