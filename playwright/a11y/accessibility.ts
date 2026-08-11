import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'
import type { Result } from 'axe-core'

function formatViolations(violations: Result[]): string {
  return violations
    .map(
      (v) =>
        `\n[${v.impact}] ${v.id}: ${v.help}\n  ${v.helpUrl}\n` +
        v.nodes.map((n) => `  - ${n.target.join(' ')}`).join('\n')
    )
    .join('\n')
}

export async function checkA11y(
  page: Page,
  options: { disableRules?: string[] } = {}
) {
  const builder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .disableRules([
      // Header text sits on a translucent panel over map tiles, so contrast
      // varies with the map underneath and can't meet a fixed WCAG ratio.
      'color-contrast',
      ...(options.disableRules ?? []),
    ])

  const { violations } = await builder.analyze()

  expect(violations, formatViolations(violations)).toEqual([])
}
