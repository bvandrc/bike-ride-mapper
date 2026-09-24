import { vol } from 'memfs'

import type { NdJsonMeta } from '@/types'

vi.mock('node:fs', async () => {
  const { fs } = await import('memfs')
  return { ...fs, default: fs }
})

const PROJECT = '/project'
const OUT_FILE = `${PROJECT}/public/workouts.ndjson`

/**
 * A workout as it sits on disk.
 *
 * Typed as the JSON it is rather than as `CustomWorkout`: what the script
 * guards against is a file the type says cannot exist, so a fixture held to
 * that type could not express the cases below.
 */
const workout = (overrides: Record<string, unknown> = {}) => ({
  title: 'A ride',
  geoJson: { type: 'FeatureCollection', features: [] },
  workout: { name: 'A ride' },
  route: { name: 'A route' },
  activityType: { name: 'Bike Ride' },
  ...overrides,
})

/** Runs the script, which does its work on import. */
const build = async (workouts: Record<string, unknown>) => {
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
  vi.resetModules()
  await import('../build-workouts-ndjson')

  const written = vol.readFileSync(OUT_FILE, 'utf8') as string
  const [meta, ...rows] = written.trimEnd().split('\n')
  return {
    meta: JSON.parse(meta) as NdJsonMeta,
    rows: rows.map((row) => JSON.parse(row) as Record<string, unknown>),
  }
}

describe('build-workouts-ndjson', () => {
  beforeEach(() => {
    vi.spyOn(process, 'cwd').mockReturnValue(PROJECT)
    vi.spyOn(console, 'log').mockImplementation(() => undefined)
    vi.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  it('heads the file with the total, then one workout per line', async () => {
    const { meta, rows } = await build({
      'a.json': workout(),
      'b.json': workout(),
    })

    expect(meta).toEqual({ _meta: { total: 2 } })
    expect(rows).toHaveLength(2)
  })

  it('counts what it wrote, not what it read', async () => {
    const { meta, rows } = await build({
      'kept.json': workout(),
      'flagged.json': workout({ pathHasIssue: true }),
    })

    expect(meta._meta?.total).toBe(1)
    expect(rows).toHaveLength(1)
  })

  it('leaves out a workout whose path is flagged as wrong', async () => {
    const { rows } = await build({
      'flagged.json': workout({ pathHasIssue: true }),
    })

    expect(rows).toEqual([])
  })

  it('leaves out a workout missing a field the map needs', async () => {
    for (const field of ['geoJson', 'workout', 'route', 'activityType']) {
      const { rows } = await build({
        'incomplete.json': workout({ [field]: undefined }),
      })

      expect(rows, field).toEqual([])
    }
  })

  it('writes a file with a zero total rather than none at all', async () => {
    // The app fetches this path either way, so an absent file is a 404.
    const { meta, rows } = await build({})

    expect(meta).toEqual({ _meta: { total: 0 } })
    expect(rows).toEqual([])
  })
})
