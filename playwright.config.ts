import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests/browser', expect: { timeout: 15_000 }, timeout: 60_000, workers: 1, fullyParallel: false,
  use: {
    baseURL: 'http://127.0.0.1:3100', trace: 'retain-on-failure',
    launchOptions: process.platform === 'darwin' ? { executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' } : {}
  }
})
