import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests: the whole site, built for production, used in real
 * browsers like a visitor would. Tests live in e2e/; run them with
 * `pnpm test:e2e` (or `pnpm test:e2e:ui` to watch them step by step).
 *
 * Port 3123, not 3000, so they never clash with your `pnpm dev`.
 *
 * To test a site that is already online instead (production, or a Vercel
 * preview), give its address: nothing is built or served locally.
 *   E2E_BASE_URL=https://barrosw5-dev.vercel.app pnpm test:e2e
 */
const PORT = 3123;
const deployedURL = process.env.E2E_BASE_URL;
const baseURL = deployedURL ?? `http://localhost:${PORT}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // A `test.only` left in by mistake would silently skip every other test
  forbidOnly: isCI,
  // One retry on CI; the trace of the failed try is kept to see what happened
  retries: isCI ? 1 : 0,
  reporter: isCI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],

  use: {
    baseURL,
    // Every test starts as an English-speaking visitor with a light OS
    // theme; tests that need something else say so with test.use()
    locale: "en-US",
    colorScheme: "light",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  // Every test runs in each of these: 3 desktop engines and 2 phones
  projects: [
    { name: "desktop-chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "desktop-firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "desktop-webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-android", use: { ...devices["Pixel 7"] } },
    { name: "mobile-iphone", use: { ...devices["iPhone 15"] } },
  ],

  // Builds the site and serves it before the tests (as the Next.js docs
  // recommend: test the production build, not `next dev`). Locally, an
  // already running `pnpm start -p 3123` is reused.
  webServer: deployedURL
    ? undefined
    : {
        command: `pnpm build && pnpm start -p ${PORT}`,
        url: `${baseURL}/en`,
        reuseExistingServer: !isCI,
        timeout: 240_000,
      },
});
