import { test, expect } from '@playwright/test';
import { LoginWorkflow } from '../workflows/login.js';
import { PlaywrightEnvironmentSetup } from '../setup/playwright-environment-setup.js';
import { UCCSearchTrue } from '../workflows/ucc-search-true.js';

let env;
let loginWorkflow;
let uccSearchTrueWorkflow;

function extractOrderId(id) {
  const match = id?.match(/O-\d+/);
  return match ? match[0] : null;
}

function extractGroupId(groupId) {
  let textToExtractFrom;

  if (Array.isArray(groupId)) {
    textToExtractFrom = groupId[0]; // First item
  } else if (typeof groupId === 'string') {
    textToExtractFrom = groupId;
  }

  if (typeof textToExtractFrom === 'string') {
    const match = textToExtractFrom.match(/G-\d+/);
    return match ? match[0] : null;
  }

  return null;
}

test.describe.serial('UCC Search True - End to End API + UI Automation', () => {
  test.beforeAll(async () => {
    env = new PlaywrightEnvironmentSetup();
    await env.setupSuite();

    loginWorkflow = new LoginWorkflow();
    uccSearchTrueWorkflow = new UCCSearchTrue();

    // Inject page and API list into workflows
    for (const workflow of [loginWorkflow, uccSearchTrueWorkflow]) {
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

  test('UCC Search - True API + UI validation', async () => {
    const getOrderDetailsAPI = env.getAPIList().get('Get Order Details');
    const uccSearchAPI = env.getAPIList().get('UCC Search - True');
    const getCaseDetailsAPI = env.getAPIList().get('Get Case Details');
    const getAttachmentIdAPI = env.getAPIList().get('Get Attachment ID');
    const uploadAttachmentAPI = env.getAPIList().get('Upload Attachment');
    const submitLineCaseAPI = env.getAPIList().get('Submit Line Case');
    const submitResultsStageAPI = env.getAPIList().get('Submit - Result Stage');
    const feesValidAPI = env.getAPIList().get('Fees Valid - True');
    const invoicingFaliureAPI = env.getAPIList().get('Invoicing Failure');
    const runtimeData = {
      orderId: 'O-2785566' // Replace with dynamic ID if needed
    };

    // Fetch order and groupId using API
    const result = await uccSearchTrueWorkflow.executeGetOrderDetails(getOrderDetailsAPI, runtimeData);

    if (!result?.id) {
      console.warn('[FAIL] No valid Order ID was returned from Get Order Details API. Test aborted.');
      test.skip();
    }

    runtimeData.orderId = result.id;
    runtimeData.groupId = extractGroupId(result.groupId);

    const orderId = extractOrderId(runtimeData.orderId);
    const groupId = runtimeData.groupId;

    if (!orderId || !groupId) {
      console.warn('[FAIL] Could not extract valid orderId/groupId. Skipping test.');
      test.skip();
    }

    // API Call to Search UCC Assignment
    await uccSearchTrueWorkflow.executeUCCSearchTrue(uccSearchAPI, runtimeData);

    const attachmentId = await uccSearchTrueWorkflow.executeGetAttachmentID(getAttachmentIdAPI, runtimeData);
    console.log(`[LOG] Attachment Id - ${attachmentId}`);

    // await uccSearchTrueWorkflow.executeUploadAttachment(uploadAttachmentAPI, runtimeData, attachmentId)
    // UI Validation
   await uccSearchTrueWorkflow.UCCSearchUIValidation(groupId, uploadAttachmentAPI, runtimeData, attachmentId, getCaseDetailsAPI, submitLineCaseAPI, submitResultsStageAPI, feesValidAPI, invoicingFaliureAPI);
  });
});
