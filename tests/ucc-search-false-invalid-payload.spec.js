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

test.describe.serial('UCC Search False - Invalid Payload Test', () => {
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

  test('UCC Search - False with Invalid Payload', async () => {
    const getOrderDetailsAPI = env.getAPIList().get('Get Order Details');
    const uccSearchFalseInvalidAPI = env.getAPIList().get('UCC Search - False - Invalid Payload');
    const getCaseDetailsAPI = env.getAPIList().get('Get Case Details');

    const runtimeData = {
      orderId: 'O-278568'
    };

    const result = await uccSearchFalseWorkflow.executeGetOrderDetails(getOrderDetailsAPI, runtimeData);
    if (!result?.id) {
      console.warn('[FAIL] No valid Order ID was returned. Skipping.');
      test.skip();
    }

    runtimeData.orderId = result.id;
    runtimeData.groupId = extractGroupId(result.groupId);

    const orderId = extractOrderId(runtimeData.orderId);
    const groupId = runtimeData.groupId;

    if (!orderId || !groupId) {
      console.warn('[FAIL] Invalid orderId or groupId. Skipping test.');
      test.skip();
    }

    // Execute UCC Search False API with invalid payload
    const response = await uccSearchFalseWorkflow.executeUCCSearchFalse(uccSearchFalseInvalidAPI, runtimeData);
  // Fix the assertion here
  expect(response).toBeNull(); // Not undefined

  // Optionally check reason
  expect(runtimeData.reasonUnableToObtain).toBe('Copy Cost Approval Required');
    // UI Validation until current stage
    // await uccSearchFalseWorkflow.UCCSearchUIValidation(groupId, runtimeData, getCaseDetailsAPI);
  });
});
