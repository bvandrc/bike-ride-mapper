import { zipObject } from 'es-toolkit'

export function getEnv<Keys extends string[]>(...keys: Keys) {
  return zipObject(
    keys,
    keys.map((key) => {
      const value = process.env[key]

      if (typeof value !== 'string' || value.trim() === '') {
        throw new Error(`Missing required environment variable: ${key}`)
      }
      return value
    })
  )
}
