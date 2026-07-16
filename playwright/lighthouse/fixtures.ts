import { rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { test as baseTest, chromium } from '@playwright/test'
import desktopConfig from 'lighthouse/core/config/desktop-config.js'
import {
  playAudit,
  type playwrightLighthouseConfig,
} from 'playwright-lighthouse'

const BASE_LIGHTHOUSE_PORT = 9222

const BASE_THRESHOLDS = {
  performance: 70, // Limited by maps API, probably the best we can do.
  accessibility: 100,
  'best-practices': 100,
  seo: 100,
}

const SKIPPED_AUDITS = [
  // header text sits on a translucent panel over map tiles (matches the axe setup)
  'color-contrast',
]

type LighthouseFixtures = {
  /** Run both desktop and mobile Lighthouse audits against the current page. */
  runAudit: (options?: {
    /** Report name prefix; lets multiple audits in one test keep separate reports. */
    name?: string
    thresholdOverrides?: playwrightLighthouseConfig['thresholds']
  }) => Promise<void>
}

type LighthouseWorkerFixtures = {
  /** CDP port lighthouse connects to. Unique per worker so parallel workers don't collide. */
  lighthousePort: number
}

/**
 * Lighthouse performs its own navigation over the CDP port rather than using
 * the Playwright `page` directly, so `context` is overridden to launch a
 * persistent Chrome profile reachable on that port — the same profile the
 * page Playwright drives and the page Lighthouse audits both live in.
 */
export const lighthouseTest = baseTest.extend<
  LighthouseFixtures,
  LighthouseWorkerFixtures
>({
  runAudit: async ({ page, lighthousePort: port }, use, testInfo) => {
    await use(async ({ name, thresholdOverrides } = {}) => {
      const runAudit = async (
        label: string,
        config?: playwrightLighthouseConfig['config'],
      ) => {
        await playAudit({
          config: {
            extends: 'lighthouse:default',
            ...config,
            settings: { ...config?.settings, skipAudits: SKIPPED_AUDITS },
          },
          page,
          port,
          thresholds: { ...BASE_THRESHOLDS, ...thresholdOverrides },
          reports: {
            formats: { html: true, json: true },
            directory: testInfo.outputPath('lighthouse'),
            name: name ? `${name}-${label}` : label,
          },
        })
      }

      await baseTest.step('desktop', () => runAudit('desktop', desktopConfig))
      await baseTest.step('mobile', () => runAudit('mobile'))
    })
  },

  lighthousePort: [
    // biome-ignore lint/correctness/noEmptyPattern: Playwright requires destructuring for the fixtures arg
    async ({}, use, workerInfo) => {
      await use(BASE_LIGHTHOUSE_PORT + workerInfo.parallelIndex)
    },
    { scope: 'worker' },
  ],

  context: async ({ lighthousePort, baseURL }, use) => {
    const userDataDir = path.join(
      os.tmpdir(),
      `pw-lighthouse-${lighthousePort}-${Date.now()}`,
    )
    const context = await chromium.launchPersistentContext(userDataDir, {
      args: [`--remote-debugging-port=${lighthousePort}`],
      baseURL,
    })

    await use(context)
    await context.close()
    // Best-effort cleanup; a leftover profile dir doesn't affect test correctness.
    await rm(userDataDir, { recursive: true, force: true }).catch(
      () => undefined,
    )
  },
})
