import { test, expect } from '@playwright/test';
import { LoginWorkflow } from '../workflows/login.js';
import { GetOrderDetails } from '../workflows/get-order-details.js';
import { PlaywrightEnvironmentSetup } from '../setup/playwright-environment-setup.js';

let env;
let loginWorkflow;
let getOrderDetails;

function extractOrderId(id) {
  const match = id.match(/O-\d+/);
  return match ? match[0] : null;
}

function extractGroupId(groupId) {
  let textToExtractFrom;

  if (Array.isArray(groupId)) {
    // Handle array with string values
    textToExtractFrom = groupId[0]; // first item in array
  } else if (typeof groupId === 'string') {
    textToExtractFrom = groupId;
  }

  if (typeof textToExtractFrom === 'string') {
    const match = textToExtractFrom.match(/G-\d+/);
    return match ? match[0] : null;
  }

  return null;
}



test.describe.serial('UCC Pega DX API + UI Modular Automation Tests', () => {
  test.beforeAll(async () => {
    env = new PlaywrightEnvironmentSetup();
    await env.setupSuite();
    loginWorkflow = new LoginWorkflow();
    getOrderDetails = new GetOrderDetails();
    for (const workflow of [loginWorkflow, getOrderDetails]) {
      workflow.page = env.page;
      workflow.getAPIList = () => env.getAPIList();
    }

    loginWorkflow.getInputData = () => env.getInputData();
  });

  test.afterAll(async () => {
    await env.teardownSuite();
  });

  test('Login into UCC application', async () => {
    const inputData = env.getInputData();
    await loginWorkflow.login(inputData.get('username'), inputData.get('password'));
  });

  test('UCC Search - true', async () => {
    test.setTimeout(30000);

    const api = env.getAPIList().get('Get Order Details');
    const uccSearchAPI = env.getAPIList().get('UCC Search - True');
    const getCaseDetails = env.getAPIList().get('Get Case Details');
    const runtimeData = {
      orderId: 'O-273225' // Replace this with actual ID
    };

    // Call and store result from executeGetOrderDetails
    const result = await getOrderDetails.executeGetOrderDetails(api, runtimeData);

    // Dtore them back into runtimeData if needed
    runtimeData.orderId = result.id;
    runtimeData.groupId = extractGroupId(groupId);

    // Pass the updated runtimeData to the next method
    await getOrderDetails.searchAndValidateOrder(extractOrderId(runtimeData.orderId), runtimeData.groupId, uccSearchAPI, runtimeData, getCaseDetails);
  });

});

