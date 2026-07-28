import { withLighthouse } from 'lighthouse-audit-utils/playwright'

const SKIPPED_AUDITS = [
  // header text sits on a translucent panel over map tiles (matches the axe setup)
  'color-contrast',
]

export const lighthouseTest = withLighthouse({
  basePort: 9222,
  lighthouseArgs: {
    flags: { disableStorageReset: true, output: ['html', 'json'] },
    config: {
      extends: 'lighthouse:default',
      settings: { skipAudits: SKIPPED_AUDITS },
    },
  },
  thresholds: {
    performance: 70, // Limited by maps API, probably the best we can do.
    accessibility: 100,
    'best-practices': 100,
    seo: 100,
  },
})
