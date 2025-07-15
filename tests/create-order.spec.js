import { test, expect } from '@playwright/test';
import { PlaywrightEnvironmentSetup } from '../setup/playwright-environment-setup.js';
import { CreateOrder } from '../workflows/create-order.js';
import fs from 'fs';

let env;
let createOrder;

// Number of times to invoke the Create Order API test
const invocationCount = 5;

test.describe.serial('API Test to create orders using DX-API', () => {
  test.beforeAll(async () => {
    env = new PlaywrightEnvironmentSetup();
    await env.setupSuite();

    createOrder = new CreateOrder();
    createOrder.page = env.page;
    createOrder.getAPIList = () => env.getAPIList();
  });

  test.afterAll(async () => {
    await env.teardownSuite();
  });

  // Dynamically create N test cases
  for (let i = 1; i <= invocationCount; i++) {
    test(`Create Order API - Invocation ${i}`, async () => {
      const api = env.getAPIList().get('Create Request');
      if (api.payloadPath) {
        const fileContents = fs.readFileSync(api.payloadPath, 'utf-8');
        api.payload = fileContents;
      }
      const runtimeData = {};
      const orderId = await createOrder.executeCreateOrder(api, runtimeData);
      expect(orderId).toBeDefined();
      if(orderId) console.log(`[Pass] Invocation ${i}: Created Order ID → ${orderId}`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    });
  }
});
