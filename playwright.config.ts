import { defineConfig, devices } from "@playwright/test";

/**
 * Configuración de QA de EquilibraMind.
 *
 * - Chromium de escritorio como navegador principal.
 * - Cada prueba recibe un contexto aislado (IndexedDB vacío) por defecto.
 * - El servidor de pruebas se levanta en el puerto 3100 con el build de
 *   producción para validar exactamente lo que se despliega.
 */
export default defineConfig({
  testDir: "./e2e",
  outputDir: "test-results/artifacts",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: 45_000,
  expect: { timeout: 7_000 },
  reporter: [
    ["list"],
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "test-results/results.json" }]
  ],
  use: {
    baseURL: "http://127.0.0.1:3100",
    locale: "es-CO",
    timezoneId: "America/Bogota",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "off",
    actionTimeout: 10_000,
    navigationTimeout: 20_000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } }
    }
  ],
  webServer: {
    command: "npm run build && npm run start -- -p 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: "pipe",
    stderr: "pipe"
  }
});
