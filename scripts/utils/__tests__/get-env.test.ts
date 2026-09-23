// The app and the scripts carry their own copy of this module, on purpose --
// Vite injects the app's values at build time. src/utils/ has the twin of this file.
import { getEnv } from '../get-env'

describe('getEnv', () => {
  beforeEach(() => {
    vi.stubEnv('PRESENT', 'a-value')
    vi.stubEnv('ALSO_PRESENT', 'another')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns each variable it was asked for, keyed by name', () => {
    expect(getEnv('PRESENT', 'ALSO_PRESENT')).toEqual({
      PRESENT: 'a-value',
      ALSO_PRESENT: 'another',
    })
  })

  it('throws on the missing one rather than handing back undefined', () => {
    expect(() => getEnv('PRESENT', 'ABSENT')).toThrow(
      'Missing required environment variable: ABSENT'
    )
  })

  it('treats a blank value as missing, which is what an unset secret is', () => {
    for (const blank of ['', '   ']) {
      vi.stubEnv('BLANK', blank)

      expect(() => getEnv('BLANK'), JSON.stringify(blank)).toThrow(
        'Missing required environment variable: BLANK'
      )
    }
  })

  it('returns nothing to check when asked for nothing', () => {
    expect(getEnv()).toEqual({})
  })
})
