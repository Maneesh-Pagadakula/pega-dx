// playwright.config.js
import { defineConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Generate timestamped folder
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
const reportDir = path.resolve(`./reports/Test_Report_${timestamp}`);

// Create folder
fs.mkdirSync(reportDir, { recursive: true });

export const allureResultsDir = path.join(reportDir, 'allure-results');

export default defineConfig({
  timeout: 30000,
  retries: 0,
  reporter: [
    ['list'],
    ['allure-playwright', { outputFolder: allureResultsDir }]
  ],
  use: {
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
