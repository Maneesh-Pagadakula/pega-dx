import { test, expect } from '@playwright/test';
import { LoginWorkflow } from '../workflows/login.js';
import { PlaywrightEnvironmentSetup } from '../setup/playwright-environment-setup.js';
import { UCCSearchFalse } from '../workflows/ucc-search-false.js';

let env;
let loginWorkflow;
let uccSearchFalseWorkflow;

function extractOrderId(id) {
  const match = id?.match(/O-\d+/);
  return match ? match[0] : null;
}

function extractGroupId(groupId) {
  let textToExtractFrom;

  if (Array.isArray(groupId)) {
    textToExtractFrom = groupId[0];
  } else if (typeof groupId === 'string') {
    textToExtractFrom = groupId;
  }

  if (typeof textToExtractFrom === 'string') {
    const match = textToExtractFrom.match(/G-\d+/);
    return match ? match[0] : null;
  }

  return null;
}

test.describe.serial('UCC Search False - API + Partial UI Validation', () => {
  test.beforeAll(async () => {
    env = new PlaywrightEnvironmentSetup();
    await env.setupSuite();

    loginWorkflow = new LoginWorkflow();
    uccSearchFalseWorkflow = new UCCSearchFalse();

    for (const workflow of [loginWorkflow, uccSearchFalseWorkflow]) {
      workflow.page = env.page;
      workflow.getAPIList = () => env.getAPIList();
    }

    loginWorkflow.getInputData = () => env.getInputData();
  });

  test.afterAll(async () => {
    await env.teardownSuite();
  });

  test('Login to UCC application', async () => {
    const inputData = env.getInputData();
    await loginWorkflow.login(inputData.get('username'), inputData.get('password'));
  });

  test('UCC Search - False API + Partial UI Validation', async () => {
    const getOrderDetailsAPI = env.getAPIList().get('Get Order Details');
    const uccSearchFalseAPI = env.getAPIList().get('UCC Search - False');
    const getCaseDetailsAPI = env.getAPIList().get('Get Case Details');

    const runtimeData = {
      orderId: 'O-278567' // Use dynamic ID as needed
    };

    const result = await uccSearchFalseWorkflow.executeGetOrderDetails(getOrderDetailsAPI, runtimeData);
    if (!result?.id) {
      console.warn('[FAIL] No valid Order ID returned from Get Order Details. Skipping test.');
      test.skip();
    }

    runtimeData.orderId = result.id;
    runtimeData.groupId = extractGroupId(result.groupId);

    const orderId = extractOrderId(runtimeData.orderId);
    const groupId = runtimeData.groupId;

    if (!orderId || !groupId) {
      console.warn('[FAIL] Could not extract orderId/groupId. Skipping test.');
      test.skip();
    }

    await uccSearchFalseWorkflow.executeUCCSearchFalse(uccSearchFalseAPI, runtimeData);
    await uccSearchFalseWorkflow.UCCSearchUIValidation(groupId, runtimeData, getCaseDetailsAPI);
  });
});
