import { defineConfig, devices } from "@playwright/test";

// Smoke-Tests gegen die gebaute Anwendung. Startet den Produktionsserver
// und prüft, dass die wichtigsten öffentlichen Seiten rendern.
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ],
  webServer: {
    command: "npm run start",
    url: "http://127.0.0.1:3000/de",
    timeout: 120_000,
    reuseExistingServer: !process.env.CI
  }
});
