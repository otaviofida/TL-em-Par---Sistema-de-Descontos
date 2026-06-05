import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      // Mock backend — porta 3333 (destino do proxy do Vite)
      command: 'npx tsx e2e/mock-server.ts',
      url: 'http://localhost:3333/api/settings',
      reuseExistingServer: !process.env.CI,
      timeout: 15000,
    },
    {
      // Frontend Vite em modo HTTP (sem basicSsl)
      command: 'vite --mode test --port 5173',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30000,
    },
  ],
});
