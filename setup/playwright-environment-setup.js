// setup/PlaywrightEnvironmentSetup.js
import { chromium, firefox, webkit } from 'playwright';
import config from '../config/config.js';
import { ExcelReader } from '../utils/excel-reader.js';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { allure } from 'allure-playwright';
import { allureResultsDir } from './playwright.config.js'; // import dynamically created path

export class PlaywrightEnvironmentSetup {
  constructor() {
    this.APIList = new Map();
    this.inputData = new Map();
    this.browser = null;
    this.context = null;
    this.page = null;

    // Folder to store screenshots
    this.screenshotFolder = path.join(allureResultsDir, 'screenshots');
    fs.mkdirSync(this.screenshotFolder, { recursive: true });
  }

  async initialize() {
    if (!config.ExcelFile) {
      throw new Error('ExcelFile not defined in Config.properties');
    }
  }

  async setupSuite() {
    await this.initialize();

    const excelReader = new ExcelReader(config.ExcelFile);
    this.APIList = excelReader.readAPIListFromExcel('API List');
    this.inputData = excelReader.readKeyValuePairs('Input Data');

    const browserName = (config.Browser || '').toLowerCase();
    let browserType;
    switch (browserName) {
      case 'chrome':
      case 'edge':
        browserType = chromium;
        break;
      case 'firefox':
        browserType = firefox;
        break;
      case 'safari':
        browserType = webkit;
        break;
      default:
        throw new Error(`Unsupported browser: ${browserName}`);
    }

    this.browser = await browserType.launch({ headless: false });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();

    if (config.URL?.trim()) {
      await this.page.goto(config.URL);
    } else {
      throw new Error('URL is not defined in Config.properties.');
    }

    await allure.step(`Browser launched and navigated to URL: ${config.URL}`, async () => {});
  }

 async teardownSuite() {
  try {
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();

    await allure.step('Browser and context closed successfully.', async () => {});
  } catch (e) {
    await allure.step(`Exception while closing browser: ${e.message}`, async () => {});
  }
}

  getAPIList() {
    return this.APIList;
  }

  getInputData() {
    return this.inputData;
  }

  async captureFullPage(page) {
    const screenshotName = `Screenshot_${uuidv4()}.png`;
    const screenshotPath = path.join(this.screenshotFolder, screenshotName);
    await page.screenshot({ path: screenshotPath, fullPage: true });

    const screenshotBuffer = fs.readFileSync(screenshotPath);
    allure.attachment(screenshotName, screenshotBuffer, 'image/png');

    return screenshotPath;
  }

  async logWithScreenshot(message, page) {
    const screenshotPath = await this.captureFullPage(page);
    await allure.step(message, async () => {});
    console.log(`Logged with screenshot: ${screenshotPath}`);
  }

  async log(message) {
    await allure.step(message, async () => {});
  }
}
