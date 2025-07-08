import { test, expect } from '@playwright/test';
import { CreateCase } from '../workflows/create-case.js';
import { LoginWorkflow } from '../workflows/login-workflow.js';
import { SelectPassportType } from '../workflows/select-passport-type.js';
import { GetCaseDetails } from '../workflows/get-case-details.js';

import { HomePageObjects } from '../page-objects/home-page-objects.js';
import config from '../config/config.js';
import { PlaywrightEnvironmentSetup } from '../setup/playwright-environment-setup.js';

test.describe('Pega DIX Application API + UI Test Suite', () => {
  let env;
  let createCase;
  let loginWorkflow;
  let selectPassportType;
  let getCaseDetails;
  let homePageObjects;

  test.beforeEach(async () => {
    env = new PlaywrightEnvironmentSetup();
    await env.setupSuite();

    createCase = new CreateCase();
    loginWorkflow = new LoginWorkflow();
    selectPassportType = new SelectPassportType();
    getCaseDetails = new GetCaseDetails();

    // Inject page/context
    createCase.page = env.page;
    loginWorkflow.page = env.page;
    selectPassportType.page = env.page;
    getCaseDetails.page = env.page;

    createCase.getAPIList = () => env.getAPIList();
    loginWorkflow.getInputData = () => env.getInputData();
    selectPassportType.getAPIList = () => env.getAPIList();
    getCaseDetails.getAPIList = () => env.getAPIList();

    homePageObjects = new HomePageObjects();
  });

  test.afterAll(async () => {
    await env.teardownSuite();
  });

  test('Full Workflow: Create Case → Select Passport Type → Get Case Details', async () => {
    let id;

    await test.step('Step 1: Log into application', async () => {
      const inputData = env.getInputData();
      await loginWorkflow.login(inputData.get('username'), inputData.get('password'));
    });

    await test.step('Step 2: Create a case via API and validate in UI', async () => {
      const api = env.getAPIList().get('Create Case');
      id = await createCase.executeCreateCase(api);
      await env.page.reload();

      await createCase.highlightAndScreenshotCaseRow(
        env.page,
        homePageObjects.linkText_caseId,
        createCase.extractCaseId(id)
      );

      await env.page.waitForTimeout(2500);
    });

    await test.step('Step 3: Execute API to select passport type', async () => {
      const api = env.getAPIList().get('Perform Assignment Action');
      await selectPassportType.executeSelectPassportType(api, id);
    });

    await test.step('Step 4: Validate passport type in UI', async () => {
      await selectPassportType.validatePassportType();
    });

    await test.step('Step 5: Verify case details reflect in API response', async () => {
      const api = env.getAPIList().get('Get Case Details');
      await getCaseDetails.executeGetCaseDetailsAPI(api, id);
    });
  });
});
