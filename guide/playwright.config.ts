import { defineConfig, devices } from '@playwright/test'

const PORT = 3101
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  use: { baseURL: `http://localhost:${PORT}`, ...devices['Desktop Chrome'] },
  webServer: { command: `PORT=${PORT} node .output/server/index.mjs`, url: `http://localhost:${PORT}`, reuseExistingServer: false, timeout: 60_000 },
})
