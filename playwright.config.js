// @ts-check
import path from 'path';
import { defineConfig, devices } from '@playwright/test';

// The only place the site address is defined. Tests use relative paths like '/amazon.html'.
// To test another address: BASE_URL=http://127.0.0.1:8080 npx playwright test
const LOCAL_URL = 'http://127.0.0.1:5500';
const baseURL = process.env.BASE_URL || LOCAL_URL;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  timeout: 60000,
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Use the Live Server already running on port 5500, or start one if there is none.
     Skipped when BASE_URL is set, and on CI where the amazon-project folder doesn't exist. */
  webServer: process.env.BASE_URL || process.env.CI ? undefined : {
    command: 'live-server --host=127.0.0.1 --port=5500 --no-browser --ignore=.git,.claude',
    cwd: path.resolve(__dirname, '../amazon-project'),
    url: `${LOCAL_URL}/amazon.html`,
    reuseExistingServer: true,
    timeout: 15000,
  },
});

