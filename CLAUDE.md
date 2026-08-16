## Project

Map of my tracked bike rides, deployed to GitHub Pages by
`.github/workflows/deploy.yml`.

- **Stack**: React 18 + Vite + TypeScript, Tailwind v4, Leaflet via
  react-leaflet, Luxon, es-toolkit, Biome, Playwright for e2e/a11y/Lighthouse.
- **Layout**: `src/` is the app; `scripts/` holds the tsx-run MapMyRide
  fetchers and the NDJSON builder; `workouts/` is the raw per-ride JSON;
  `playwright/` is all tests, with shared helpers and selectors under
  `playwright/support/`.
- **Data flow**: `pnpm get-data` pulls rides from MapMyRide into
  `workouts/*.json`, `pnpm build:workouts` rolls those into
  `public/workouts.ndjson` (first line is a `_meta` row with the total), and
  the app streams that file at runtime via `useNdjsonStream`. Both outputs are
  generated — don't hand-edit them, regenerate.
- **Base path**: Pages serves the site from a subpath, so `vite.config.ts` sets
  `base: '/bike-ride-mapper/'`. In app code, build asset and data URLs from
  `import.meta.env.BASE_URL` (see `useWorkouts.ts`) — a leading-slash path like
  `/workouts.ndjson` works in dev and 404s once deployed.

## Code conventions

Conventions live outside this file, synced from
https://github.com/bvandrc/bvandrc-conventions — follow all of them:

@conventions/typescript.md — language-level TypeScript/JavaScript rules
@conventions/react.md — component, JSX, and accessibility rules
@conventions/playwright.md — test layout, test IDs, and accessibility scans
@conventions/all.md — practice for every repo: branches, formatting, markdown, PR reviews

## Commands

- `pnpm dev` — dev server on port 5173. `pnpm build`, `pnpm preview`.
- `pnpm format` — Biome check/fix. `pnpm check` — the full gate: format plus
  `tsc` for the app and for `playwright/tsconfig.json`. Run before every
  commit; it's what CI runs.
- `pnpm preview:ci` — build and serve on port 4173, which is what the
  Playwright suites expect.
- `pnpm test:e2e`, `pnpm test:a11y`, `pnpm test:lighthouse` — the Playwright
  projects, all against a running preview server (`test:a11y` covers desktop
  and mobile). `pnpm pw:open` for the UI runner.
- `pnpm get-data` — refresh `workouts/` from MapMyRide (needs `MMR_USER_ID`
  and a token from `pnpm get-mmr-token`). `pnpm build:workouts` — regenerate
  `public/workouts.ndjson`; `prebuild` runs it for you.

## Conventions

- **Package manager**: pnpm. `npm install` writes a competing `package-lock.json` that CI ignores.
- **Leaflet**: Prefer react-leaflet's declarative components; drop to the
  imperative Leaflet API through `useMap` or a ref only where no component
  exists (see the arrow decorators in `Route.tsx`), and clean up in the effect's
  return. Alias colliding Leaflet type imports rather than renaming the
  component (`type Map as LeafletMap`).
- **Styling**: Tailwind v4 is configured CSS-first — there's no
  `tailwind.config`. Shared shadows and other one-off utilities go in
  `src/styles/index.css` as `@utility` blocks (`shadow-panel`,
  `text-shadow-black`); prefer those over repeating raw CSS in `className`.
- **Environment variables**: Read them through `getEnv()` (`src/utils/get-env.ts` in the app, `scripts/utils/get-env.ts` in scripts), never bare `process.env` — it throws on a missing or empty value instead of failing later. Vite injects them via `define`, so app code sees only what's in the environment at build time.
- **Accessibility tests**: `color-contrast` is disabled globally because the
  header sits on a translucent panel over map tiles.
- **Convention files**: `conventions/` is synced from
  https://github.com/bvandrc/bvandrc-conventions and overwritten on every
  sync. Edit a rule upstream, never in that directory.
