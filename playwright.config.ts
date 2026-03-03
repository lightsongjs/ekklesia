import { defineConfig } from "playwright/test";

export default defineConfig({
  testDir: "./tests",
  webServer: {
    command: "npx astro preview --port 4321",
    port: 4321,
    reuseExistingServer: true,
    timeout: 15000,
  },
  use: {
    baseURL: "http://localhost:4321",
  },
});
