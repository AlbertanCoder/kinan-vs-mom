import { defineConfig, devices } from '@playwright/test';

const SKELETON_URL = 'http://127.0.0.1:4175';
const LEGACY_URL = 'http://127.0.0.1:4174';

/* Legacy-first decision: the real game is the root index.html, so the default
   gate runs the legacy regression + quarantine suites against it (any
   console/page error fails). The shelved Phaser skeleton specs only run with
   KV_SKELETON=1 (npm run test:e2e:skeleton). */
const SKELETON = process.env.KV_SKELETON === '1';
const SKELETON_SPECS = ['**/smoke.spec.ts', '**/gameplay.spec.ts'];

const legacyServer = {
  command: 'node ../tools/preview-server.mjs --root .. --port 4174',
  url: LEGACY_URL + '/index.html',
  reuseExistingServer: false,
  timeout: 60_000,
};
const skeletonServer = {
  command: 'npm run build:skeleton && npx vite preview --port 4175 --strictPort',
  url: SKELETON_URL,
  reuseExistingServer: false,
  timeout: 120_000,
};

export default defineConfig({
  testDir: './tests/e2e',
  testIgnore: SKELETON ? [] : SKELETON_SPECS,
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
  webServer: SKELETON ? [legacyServer, skeletonServer] : [legacyServer],
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
    /* D1 every-device pass (2026-10-28): phone and iPad profiles run only the device test */
    { name: 'android-phone', testMatch: /devices-smoke\.spec\.ts/, use: { ...devices['Pixel 7'] } },
    { name: 'iphone', testMatch: /devices-smoke\.spec\.ts/, use: { ...devices['iPhone 13'] } },
    { name: 'ipad', testMatch: /devices-smoke\.spec\.ts/, use: { ...devices['iPad (gen 7) landscape'] } },
  ],
});
