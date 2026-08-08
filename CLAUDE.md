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
- **package.json**: Key order is enforced in CI by `bvandrc/lint-package-json`. Adding a field in the wrong place fails the lint job.
- **File naming**: kebab-case for utils (`auth-utils.ts`), PascalCase for component primitives (`DropdownMenu.tsx`), camelCase for hooks (`useSession.tsx`, `useSettings.ts`); use `.tsx` when the file exports JSX.
- **Components**: Arrow-function `const` with a named export; no default exports, unless something requires one (e.g. page components for lazy-loaded routes).
- **Prop types**: Compose from the underlying element's or library component's
  prop types — extend them, or `Pick`/`Omit` the parts you need — rather than
  re-declaring `className`, `data`, `color`, etc. Name the interface
  `<Component>Props` and export it, so other components can compose from it in
  turn (see `RouteProps` picking from `GeoJSONProps`, and `RouteLayerProps`
  picking from `RouteProps`). Type-only imports use `import type` — Biome fixes
  this for you.
- **Leaflet**: Prefer react-leaflet's declarative components; drop to the
  imperative Leaflet API through `useMap` or a ref only where no component
  exists (see the arrow decorators in `Route.tsx`), and clean up in the effect's
  return. Alias colliding Leaflet type imports rather than renaming the
  component (`type Map as LeafletMap`).
- **Tailwind sizing**: Use `size-X` Tailwind class, not `w-X h-X`.
- **Styling**: Tailwind v4 is configured CSS-first — there's no
  `tailwind.config`. Shared shadows and other one-off utilities go in
  `src/styles/index.css` as `@utility` blocks (`shadow-panel`,
  `text-shadow-black`); prefer those over repeating raw CSS in `className`.
- **Constant objects**: UPPER_CASE for names, UPPER_CASE for keys that name entries (namespace/enum-style, e.g. `ROUTES.HOME`, `SELECTORS.TASK_FORM.SUBMIT_BTN`), camelCase for keys that are typed properties of an entry (e.g. `color`, `icon` in `FEATURES`) and for function-valued keys (e.g. `SELECTORS.TASK_CARD.rankFieldBadge(field)`).
- **Comments/JSDoc**: Describe *what* and *why* from the caller's perspective. Don't restate implementation. Keep to 1–2 lines. No hedge prefixes. Don't repeat what the type signature conveys.
- **es-toolkit**: Use `es-toolkit`functions when simpler than using builtin functions-- especially `omit`/`pick`.
- **Environment variables**: Read them through `getEnv()` (`src/utils/get-env.ts` in the app, `scripts/utils/get-env.ts` in scripts), never bare `process.env` — it throws on a missing or empty value instead of failing later. Vite injects them via `define`, so app code sees only what's in the environment at build time.
- **Linting and formatting**: Biome is the linter *and* formatter — no
  eslint/prettier here. Style is single quotes, no semicolons, 2-space indent,
  80 columns; run `pnpm format` after making edits instead of hand-formatting,
  and `pnpm check` (format + both type checks) before every commit — it's what
  CI runs. Notable rules that are errors: `noFloatingPromises`,
  `noImportCycles`, `noShadow`, `noUndeclaredDependencies`, `noTsIgnore`,
  `useNumericSeparators` (`39.732_725_8`) — fix the cause, don't suppress.
- **Test IDs**: Prefer role- and text-based Playwright locators; reach for a test ID only when there's no accessible handle. When you do, use `data-testid` as the HTML attribute and as the prop name in component interfaces (not `testId`), and define every value in `playwright/support/constants.ts` before using it in a test.
- **Accessible names**: If an `aria-label`'s value would just repeat text already visible in a nearby element (e.g. a row label, column header, or adjacent title), use `aria-labelledby` pointing at that existing element's `id` (add one via React's `useId` if it doesn't have one) instead of duplicating the string. Note: Don't introduce a new `sr-only` element just to make this work — if there's no existing visible text to point to, a plain `aria-label` is fine.
- **Accessibility tests**: axe runs at WCAG 2.1 AA plus best-practice on desktop and mobile, and violations fail CI. Cover each new meaningful UI state with a `checkA11y(page)` scan in `playwright/a11y/`. `color-contrast` is disabled globally because the header sits on a translucent panel over map tiles.
- **Branch naming**: Name work branches `feat/<slug>`, `fix/<slug>`, or `chore/<slug>`, with a short kebab-case slug describing the change. Never use a `claude/` prefix or a random session suffix. This overrides the branch name a session is assigned by default — if you were given one, rename it before the first push.
- **PR review threads**: Always reply on the thread with what changed (or why it wasn't changed), then mark the thread resolved. Do this for every thread you act on, not just the ones that needed discussion.
