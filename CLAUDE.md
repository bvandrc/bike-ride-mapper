
## Conventions

- **Package manager**: pnpm. `npm install` writes a competing `package-lock.json` that CI ignores.
- **File naming**: kebab-case for utils (`auth-utils.ts`), PascalCase for component primitives (`DropdownMenu.tsx`), camelCase for hooks (`useSession.tsx`, `useSettings.ts`); use `.tsx` when the file exports JSX.
- **Components**: Arrow-function `const` with a named export; no default exports, unless something requires one (e.g. page components for lazy-loaded routes). Name the props interface `<Component>Props`, export it, and compose from other props interfaces with `Pick` (see `RouteLayerProps` in `RouteLayer.tsx`).
- **Tailwind sizing**: Use `size-X` Tailwind class, not `w-X h-X`.
- **Constant objects**: UPPER_CASE for names, UPPER_CASE for keys that name entries (namespace/enum-style, e.g. `ROUTES.HOME`, `SELECTORS.TASK_FORM.SUBMIT_BTN`), camelCase for keys that are typed properties of an entry (e.g. `color`, `icon` in `FEATURES`) and for function-valued keys (e.g. `SELECTORS.TASK_CARD.rankFieldBadge(field)`).
- **Comments/JSDoc**: Describe *what* and *why* from the caller's perspective. Don't restate implementation. Keep to 1–2 lines. No hedge prefixes. Don't repeat what the type signature conveys.
- **es-toolkit**: Use `es-toolkit`functions when simpler than using builtin functions-- especially `omit`/`pick`.
- **Formatting**: Run `pnpm format` after making edits. Run `pnpm check` (format + both type checks) before every commit — it's what CI runs.
- **Linting**: Biome is the only linter and formatter — no ESLint or Prettier. Let `pnpm format` do the formatting rather than hand-matching style. Rules that bite most often: type-only imports (`useImportType`), no namespace imports, numeric separators (`39.732_725_8`), no floating promises, no `@ts-ignore`, no import cycles, no shadowing.
- **Test IDs**: Prefer role- and text-based Playwright locators; reach for a test ID only when there's no accessible handle. When you do, use `data-testid` as the HTML attribute and as the prop name in component interfaces (not `testId`), and define every value in `playwright/support/constants.ts` before using it in a test.
- **Accessible names**: If an `aria-label`'s value would just repeat text already visible in a nearby element (e.g. a row label, column header, or adjacent title), use `aria-labelledby` pointing at that existing element's `id` (add one via React's `useId` if it doesn't have one) instead of duplicating the string. Note: Don't introduce a new `sr-only` element just to make this work — if there's no existing visible text to point to, a plain `aria-label` is fine.
- **Accessibility tests**: axe runs at WCAG 2.1 AA plus best-practice on desktop and mobile, and violations fail CI. Cover each new meaningful UI state with a `checkA11y(page)` scan in `playwright/a11y/`.
- **Playwright suites**: Tests are selected by directory — `playwright/{e2e,a11y,lighthouse}/*.spec.ts` — and run against `vite preview`, not the dev server. Run them with `pnpm test:e2e`, `pnpm test:a11y`, `pnpm test:lighthouse`. There is no unit-test runner; don't add one without asking.
- **Base path**: The app deploys under `/bike-ride-mapper/`. Build asset and data URLs from `import.meta.env.BASE_URL` (see `useWorkouts.ts`) — a root-relative path works in dev and 404s in production.
- **Environment variables**: Read them through `getEnv()` (`src/utils/get-env.ts`, `scripts/utils/get-env.ts`), never bare `process.env` — it throws on a missing or empty value instead of failing later.
- **Generated data**: `public/workouts.ndjson` is built by `pnpm build:workouts` from `workouts/*.json`. Don't hand-edit either; regenerate.
- **package.json**: Key order is linted in CI (`bvandrc/lint-package-json`), so keep it ordered when adding fields or scripts.
- **Branch naming**: Name work branches `feat/<slug>`, `fix/<slug>`, or `chore/<slug>`, with a short kebab-case slug describing the change. Never use a `claude/` prefix or a random session suffix. This overrides the branch name a session is assigned by default — if you were given one, rename it before the first push.
- **PR review threads**: Always reply on the thread with what changed (or why it wasn't changed), then mark the thread resolved. Do this for every thread you act on, not just the ones that needed discussion.
