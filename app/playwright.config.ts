import { defineConfig, devices } from '@playwright/test';

const APP_URL = 'http://127.0.0.1:4173';
const LEGACY_URL = 'http://127.0.0.1:4174';

/* Milestone 1 browser gates: real-browser smoke (desktop + touch-emulated)
   and legacy-quarantine checks, failing on any console/page error.
   Legacy reference build is served from the repository root. */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  /* Bound concurrent software-WebGL contexts. A 10-worker local run left a
     Firefox renderer unresponsive; the identical test passed in isolation. */
  workers: process.env.CI ? 2 : 4,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  use: {
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'npm run build && npm run preview',
      url: APP_URL,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'node ../tools/preview-server.mjs --root .. --port 4174',
      url: LEGACY_URL + '/index.html',
      reuseExistingServer: false,
      timeout: 60_000,
    },
  ],
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'touch-tablet-chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1138, height: 712 },
        hasTouch: true,
        isMobile: true,
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], viewport: { width: 1280, height: 720 } },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 720 } },
    },
  ],
});
