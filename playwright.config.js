// E2E na versão web do app (react-native-web) contra a API real + PostgreSQL de teste.
// Pré-requisito: banco no ar (`npm run db:up` dentro de server/). O banco de teste é recriado a cada execução.
const path = require("path");
const { defineConfig, devices } = require("@playwright/test");
const { TEST_DATABASE_URL, TEST_JWT_SECRET } = require("./server/tests/testDatabase");

const API_PORT = 3100;
const WEB_PORT = 8091;

module.exports = defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/globalSetup.js",
  timeout: 90_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${WEB_PORT}`,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...devices["Desktop Chrome"],
  },
  webServer: [
    {
      // API apontando para o banco de teste (nunca para o de desenvolvimento).
      command: "node src/index.js",
      cwd: path.join(__dirname, "server"),
      url: `http://localhost:${API_PORT}/health`,
      reuseExistingServer: false,
      timeout: 30_000,
      env: { PORT: String(API_PORT), DATABASE_URL: TEST_DATABASE_URL, DATABASE_SSL: "false", JWT_SECRET: TEST_JWT_SECRET },
    },
    {
      command: `npx expo start --web --port ${WEB_PORT}`,
      url: `http://localhost:${WEB_PORT}`,
      reuseExistingServer: false,
      timeout: 240_000,
      env: { CI: "1", EXPO_NO_TELEMETRY: "1", EXPO_PUBLIC_API_URL: `http://localhost:${API_PORT}` },
    },
  ],
});
