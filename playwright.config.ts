const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./tests/e2e",
  timeout: 30 * 1000,
  projects: (() => {
    const projects = [
      {
        name: "chromium",
        use: { ...devices["Desktop Chrome"] },
      },
    ];

    if (process.env.PLAYWRIGHT_ALL_BROWSERS === "true") {
      projects.push({
        name: "firefox",
        use: { ...devices["Desktop Firefox"] },
      });
    }

    return projects;
  })(),
  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});