// playwright.config.js
import { defineConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Generate timestamped folder
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
// const reportDir = path.resolve(`./reports/Test_Report_${timestamp}`);
const reportDir = path.resolve('./reports/latest');

// Create base report folder and subfolders
fs.mkdirSync(reportDir, { recursive: true });

export const allureResultsDir = path.join(reportDir, 'allure-results');
export const htmlReportDir = path.join(reportDir, 'html-report');

fs.mkdirSync(htmlReportDir, { recursive: true });
fs.mkdirSync(allureResultsDir, { recursive: true });

export default defineConfig({
  testDir: '../tests',
  timeout: 6000000,
  retries: 0,
  reporter: [
    ['list'],
    ['allure-playwright', { outputFolder: allureResultsDir }],
    ['html', { outputFolder: htmlReportDir, open: 'never' }] // open can be 'always' | 'never' | 'on-failure'
  ],
  use: {
    headless: false,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
