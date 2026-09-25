import { typedFromEntries } from '@/utils'

export function getEnv<Keys extends string[]>(...keys: Keys) {
  return typedFromEntries(
    // Annotated as a tuple so the keys stay the ones asked for rather than
    // widening to `string`.
    keys.map((key): [Keys[number], string] => {
      const value = process.env[key]

      if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`Missing required environment variable: ${key}`)
      }
      return [key, value]
    })
  )
}
