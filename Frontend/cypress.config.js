import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,

    // Timeout settings
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,

    // Test settings
    retries: {
      runMode: 2, // Retry 2 lần khi chạy headless (CI/CD)
      openMode: 0, // Không retry khi chạy GUI (development)
    },

    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config;
    },

    // Môi trường test
    env: {
      apiUrl: "http://localhost:4000",
      adminUrl: "http://localhost:5174",
    },

    // Folder structure
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
    fixturesFolder: "cypress/fixtures",
    videosFolder: "cypress/videos",
    screenshotsFolder: "cypress/screenshots",

    // Exclude từ Git
    excludeSpecPattern: ["**/node_modules/**", "**/dist/**", "**/build/**"],
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
