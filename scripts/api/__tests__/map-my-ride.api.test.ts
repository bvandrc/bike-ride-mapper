import { buildRoute, buildWorkout } from '@/schemas/__tests__/fixtures'
import { MapMyRideClient } from '../map-my-ride.api'

/** Answers every request with `body` as JSON. */
const mockFetch = (body: unknown) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json(body))
  )

describe('MapMyRideClient', () => {
  beforeEach(() => {
    vi.stubEnv('MMR_CLIENT_ID', 'client-id')
    vi.stubEnv('MMR_AUTH_TOKEN', 'auth-token')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('returns a route that matches its schema', async () => {
    const ROUTE = buildRoute()
    mockFetch(ROUTE)

    const route = await new MapMyRideClient().getRoute(buildWorkout())

    expect(route).toEqual(ROUTE)
  })

  it('names the endpoint and the field when a response does not match', async () => {
    const WORKOUT = buildWorkout()
    mockFetch({ ...buildRoute(), distance: 'far' })

    await expect(new MapMyRideClient().getRoute(WORKOUT)).rejects.toThrow(
      new RegExp(`${WORKOUT._links.route[0].href}[\\s\\S]*distance`)
    )
  })
})
