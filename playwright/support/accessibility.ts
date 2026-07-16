import AxeBuilder from '@axe-core/playwright'
import { expect, type Page } from '@playwright/test'
import type { ImpactValue, Result } from 'axe-core'

const FAILING_IMPACTS = [
  'minor',
  'moderate',
  'serious',
  'critical',
] as const satisfies readonly ImpactValue[]

// Header text sits on a translucent panel over map tiles, so contrast
// varies with the map underneath and can't meet a fixed WCAG ratio.
const ALWAYS_DISABLED_RULES = ['color-contrast']

function formatViolations(violations: Result[]): string {
  return violations
    .map(
      (v) =>
        `\n[${v.impact}] ${v.id}: ${v.help}\n  ${v.helpUrl}\n` +
        v.nodes.map((n) => `  - ${n.target.join(' ')}`).join('\n'),
    )
    .join('\n')
}

export async function checkA11y(
  page: Page,
  options: { disableRules?: string[] } = {},
) {
  const builder = new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .disableRules([...ALWAYS_DISABLED_RULES, ...(options.disableRules ?? [])])

  const { violations } = await builder.analyze()
  const failing = violations.filter((v) =>
    FAILING_IMPACTS.includes(v.impact as (typeof FAILING_IMPACTS)[number]),
  )

  expect(failing, formatViolations(failing)).toEqual([])
}
