import { defineConfig, devices } from '@playwright/test'

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    }
  ],
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  testDir: './e2e/accessibility',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry'
  },

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'pnpm dev',
    env: {
      NEXT_PUBLIC_SANITY_DATASET: 'production',
      NEXT_PUBLIC_SANITY_PROJECT_ID: 'mock-project-id',
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-anon-key',
      NEXT_PUBLIC_SUPABASE_URL:
        process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://127.0.0.1:54321'
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: 'http://localhost:3000'
  },
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined
})
