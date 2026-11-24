// Dois projetos: "unit" (sem banco) e "integration" (supertest + PostgreSQL de teste).
const common = {
  testEnvironment: "node",
  setupFiles: ["<rootDir>/tests/setupEnv.js"],
};

module.exports = {
  projects: [
    { ...common, displayName: "unit", testMatch: ["<rootDir>/tests/unit/**/*.test.js"] },
    {
      ...common,
      displayName: "integration",
      testMatch: ["<rootDir>/tests/integration/**/*.test.js"],
      globalSetup: "<rootDir>/tests/integration/globalSetup.js",
    },
  ],
};
