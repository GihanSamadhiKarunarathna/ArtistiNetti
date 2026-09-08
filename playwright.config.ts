import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    // Piped to a fixed path so tests can read dev-mode fallback output (e.g.
    // magic-link URLs logged when RESEND_API_KEY is unset) — see tests/e2e/helpers.ts.
    command: `${process.env.CI ? "npm run start" : "npm run dev"} > /tmp/artistinetti-dev.log 2>&1`,
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
