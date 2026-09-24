// The app carries a byte-identical copy at src/utils/get-env.ts, on purpose --
// Vite injects its values at build time. One set of cases covers the behaviour;
// if the two ever diverge, the app's copy earns its own.
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
})
