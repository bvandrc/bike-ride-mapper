/**
 * Builds a single NDJSON file from the workouts folder for static hosting.
 *
 * Run from the project root: `pnpm build:workouts`. The output is
 * `public/workouts.ndjson`, whose first line is a `_meta` row carrying the
 * total, followed by one workout per line. Each file is parsed against
 * `CustomWorkoutSchema` on the way, and one that doesn't match fails the run.
 */
import fs from 'node:fs'
import path from 'node:path'
import { z } from 'zod'

import { CustomWorkoutSchema } from '@/schemas/custom-workout'
import type { NdJsonMeta } from '@/types'

const WORKOUTS_DIR = path.join(process.cwd(), 'workouts')
const OUT_DIR = path.join(process.cwd(), 'public')
const OUT_FILE = path.join(OUT_DIR, 'workouts.ndjson')

function writeFile(lines: string[]) {
  fs.mkdirSync(OUT_DIR, { recursive: true })
  const total = lines.length
  const content = `${[
    JSON.stringify({ _meta: { total } } satisfies NdJsonMeta),
    ...lines,
  ].join('\n')}\n`
  fs.writeFileSync(OUT_FILE, content, 'utf-8')
  console.log(`Wrote ${OUT_FILE} with ${total} workouts`)
}

function build() {
  if (!fs.existsSync(WORKOUTS_DIR)) {
    writeFile([])
    return
  }

  const files = fs.readdirSync(WORKOUTS_DIR).filter((f) => f.endsWith('.json'))
  const lines: string[] = []
  for (const file of files) {
    const raw = fs.readFileSync(path.join(WORKOUTS_DIR, file), 'utf-8')
    const result = CustomWorkoutSchema.safeParse(JSON.parse(raw))
    // A file that doesn't match fails the build, and with it the deploy,
    // rather than shipping a ride the map can't draw.
    if (!result.success)
      throw new Error(`${file} is invalid:\n${z.prettifyError(result.error)}`)
    if (result.data.pathHasIssue === true) continue
    lines.push(JSON.stringify(result.data))
  }

  writeFile(lines)
}

build()
