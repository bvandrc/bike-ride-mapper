# Playwright conventions

Builds on the language-level rules in `./typescript.md` — follow those too.

- **Layout**: All Playwright tests live in `playwright/`, split by project:
  `playwright/e2e/`, `playwright/a11y/`, `playwright/lighthouse/`, with shared
  helpers and selectors under `playwright/support/`. Type checking uses
  `playwright/tsconfig.json`, separate from the app's.
- **Test ID registry**: Define every `data-testid` value in
  `playwright/support/constants/selectors.ts` before using it in a test: nest
  by component, build strings with the `testId()` helper (never a hand-written
  `[data-testid="..."]`), and name a container's own testid `SELF`.
- **Accessibility tests**: axe runs at WCAG 2.1 AA plus best-practice on
  desktop and mobile, and violations fail CI. Cover each new meaningful UI
  state with a `checkA11y(page)` scan in `playwright/a11y/`.
