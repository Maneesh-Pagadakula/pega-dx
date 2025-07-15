import { PlaywrightActions } from '../setup/playwright-actions.js';
import { APIHelper } from '../helper-methods/APIHelper.js';
import { APIRequestExecutor } from '../helper-methods/APIRequestExecutor.js';
import { expect } from '@playwright/test';
import { HomePageObjects } from '../page-objects/home-page-objects.js';
import { orderFulfillmentPageObjects } from '../page-objects/order-fulfillment-page-objects.js';

export class GetOrderDetails extends PlaywrightActions {
    constructor() {
        super();
        this.homePage = new HomePageObjects();
        this.orderFulfillmentPage = new orderFulfillmentPageObjects();
    }


    async executeGetOrderDetails(api, runtimeData) {
        try {
            const url = APIHelper.buildURL(api, runtimeData);
            const method = APIHelper.getRequestType(api);
            const headers = await APIHelper.getHeaders(api); // async!

            await this.log(`Prepared Request for Get Order Details <br>URL: \`${url}\`<br>Method: \`${method}\``);

            const response = await APIRequestExecutor.get(url, headers);
            const responseCode = response.status;
            const responseBody = response.body;
            await this.log(`Response from Get Order Details API <br>Status Code: ${responseCode}<br>Response Body: <br><pre>${JSON.stringify(responseBody, null, 2)}</pre>`);

            const id = responseBody.ID;
            expect(id).not.toBeFalsy();
            await this.log(`Fetched Order ID: <b>${id}</b>`);
            console.log("OrderID - " + id);

            const coveredKeysLogs = responseBody?.content?.pxCoveredInsKeys;
            console.log("GroupId" + coveredKeysLogs);

            if (Array.isArray(coveredKeysLogs) && coveredKeysLogs.length > 0) {
                await this.log(`Extracted pxCoveredInsKeys from Content -> Order Payload:<br><pre>${JSON.stringify(coveredKeysLogs, null, 2)}</pre>`);
            } else {
                await this.log("No pxCoveredInsKeys found in Order Payload under Content.");
            }

            // Return both id and groupId
            return {
                id,
                groupId: coveredKeysLogs
            };
        } catch (e) {
            await this.log(`API call failed with message - <br>${e.message}<br>, could not retrieve order details`);
            console.error(e.message);
            throw new Error("Workflow of fetching order details using DX-API failed");
        }
    }
async executeGetCaseDetails(api, runtimeData) {
  try {
    const url = APIHelper.buildURL(api, runtimeData);
    const method = APIHelper.getRequestType(api);
    const headers = await APIHelper.getHeaders(api); // async!

    await this.log(`Prepared Request for Get Case Details <br>URL: \`${url}\`<br>Method: \`${method}\``);

    const response = await APIRequestExecutor.get(url, headers);
    const responseCode = response.status;
    const responseBody = response.body;

    await this.log(`Response from Get Case Details API <br>Status Code: ${responseCode}<br>Response Body: <br><pre>${JSON.stringify(responseBody, null, 2)}</pre>`);

    const stageLabel = responseBody?.content?.pxCurrentStageLabel;

    if (stageLabel) {
      await this.log(`Fetched Current Stage Label: <b>${stageLabel}</b>`);
    } else {
      await this.log(`No \`pxCurrentStageLabel\` found in the case content.`);
    }

    // Return the extracted label
    return {
      pxCurrentStageLabel: stageLabel || null
    };

  } catch (e) {
    await this.log(`API call failed with message - <br>${e.message}<br>, could not retrieve case details`);
    console.error(e.message);
    throw new Error("Workflow of fetching case details using DX-API failed");
  }
}

    /**
     * Executes the "UCC Search - True" API call using groupId.
     * Returns parsed response content if successful.
     */
    async executeUCCSearchTrue(api, runtimeData) {
        try {
            if (!api) throw new Error('API config for UCC Search - True not found');
            const url = APIHelper.buildURL(api, runtimeData);
            console.log(url);
            const headers = await APIHelper.getHeaders(api);
            const payload = await APIHelper.getRequestBody(api); // loads UCC Search - True.json
            console.log("----------------------------Payload" + payload);
            await this.log(`Calling UCC Search API<br>URL: ${url}<br>Payload:<pre>${JSON.stringify(payload, null, 2)}</pre>`);

            const response = await APIRequestExecutor.post(url, headers, payload);
            const status = response.status;
            const body = response.body;

            if (status === 200) {
                const content = body;
                console.log(body);
                await this.log(`UCC Search Success<br>Status: ${status}<br><pre>${JSON.stringify(content, null, 2)}</pre>`);
                return content;
            } else {
                await this.logWithScreenshot(`UCC Search failed<br>Status: ${status}<br>Body: <pre>${JSON.stringify(body, null, 2)}</pre>`, this.page);
                               console.log(body);
                return null;
            }
        } catch (e) {
            await this.logWithScreenshot(`Exception during UCC Search<br>${e.message}`, this.page);
            return null;
        }
    }


    /**
   * Search and validate order in UI using orderId and extracted groupId
   */
    async searchAndValidateOrder(orderId, groupId, uccSearchAPI, runtimeData, getCaseDetails) {
        const {
            dropdown_launchPortal,
            option_caseWorker
        } = this.homePage;

        const {
            title_orderFulfillment,
            textbox_search,
            button_search,
            text_caseType,
            text_orderId,
            title_orderLinks,
            text_group,
            text_Search,
            text_Results,
            button_begin,
            button_yes,
            button_no,
            text_completeSearch,
            button_anytimeActions,
            option_Refresh
        } = this.orderFulfillmentPage

        // Step 1: Search
        await this.click(dropdown_launchPortal, 'Launch Portal (Rocket Icon)');
        this.wait(2);
        await this.clickAndSwitchToNewTab(option_caseWorker, 'Option - Case Worker');
        this.wait(5);
        // await this.verifyElementDisplayed(title_orderFulfillment, 'Title - Order Fulfillment'); 
        await this.log('Successfully navigated to \"Order Fulfillment\" page');
        this.wait(2);
        await this.click(textbox_search, "search box");
        // await this.verifyElementDisplayed(textbox_search, 'Textbox - Search'); 
        this.wait(2);
        await this.enterValue(textbox_search, orderId);
        await this.log(`Searching for Order ID: <b>${orderId}</b>`);
        this.wait(2);
        // await this.verifyElementDisplayed(button_search, 'Button - Search'); 
        await this.click(button_search, 'Button - Search');
        this.wait(5);
        await this.verifyElementDisplayed(text_caseType, 'Case Type - Order Fulfillemt');
        const caseType_from_ui = await this.getText(text_caseType, 'Case Type - Order Fulfillment');
        console.log(caseType_from_ui);

        const orderIdSelector = `//table[@class='gridTable ']//tr[contains(@class,'cellCont')]/td[5]/div//a[normalize-space(text())='${orderId}']`; // use extracted groupId
        await this.verifyElementDisplayed(orderIdSelector, `Order Id (${orderId})`);
        const orderId_from_ui = await this.getText(orderIdSelector, `Group Id (${orderId})`);
        console.log("Extracted Order ID from UI:", orderId_from_ui);

        // Optional validation
        if (!orderId_from_ui.includes(orderId)) {
            throw new Error(`Order ID mismatch! Expected: ${orderId}, Found: ${orderId_from_ui}`);
        }
        await this.log(`Order ID validated in UI: <b>${orderId_from_ui}</b>`);
        this.wait(5);

        await this.verifyElementDisplayed(text_group, 'Description - Group Name');
        const caseGroup_from_ui = await this.getText(text_group, 'Description - Group Name');
        console.log(caseGroup_from_ui);

        const groupIdSelector = `//table[@class='gridTable ']//tr[contains(@class,'cellCont')]/td[5]/div//a[normalize-space(text())='${groupId}']`; // use extracted groupId`; // use extracted groupId
        await this.verifyElementDisplayed(groupIdSelector, `Group Id (${groupId})`);
        const groupId_from_ui = await this.getText(groupIdSelector, `Group Id (${groupId})`);
        console.log("Extracted Group ID from UI:", groupId_from_ui);

        // Optional validation
        if (!groupId_from_ui.includes(groupId)) {
            throw new Error(`Group ID mismatch! Expected: ${groupId}, Found: ${groupId_from_ui}`);
        }
        await this.log(`Group ID validated in UI: <b>${groupId_from_ui}</b>`);

        await this.click(groupIdSelector, 'Link - Group Id - ' + groupId);
        await this.wait(5);


        await this.verifyElementDisplayed(button_begin, 'Buttin - Begin');
        const frame = await this.page.frame({ name: 'PegaGadget1Ifr' });
        if (!frame) {
            await this.logWithScreenshot('Iframe not found', this.page);
            throw new Error('Iframe not available');
        }
        const btn = frame.locator(`xpath=${button_begin}`);
        const actionType_Search = frame.locator(`xpath=${text_Search}`);
        console.log('Handle exists in iframe?', !!(await btn.elementHandle()));
        const elementHandle = await frame.$(`xpath=${button_begin}`);
        console.log('Search Action exists in iframe?', !!(await actionType_Search.elementHandle()));
        const textHandle = await frame.$(`xpath=${text_Search}`);
let extractedText = '';

if (textHandle) {
  extractedText = (await textHandle.innerText()).trim();
  this.log(`Text extracted from iframe Search element: <b>${extractedText}</b>`);
} else {
  await this.logWithScreenshot('Search text element not found inside iframe', this.page);
}
// Compare the extracted text with pxCurrentStageLabel 
const { pxCurrentStageLabel } = await this.executeGetCaseDetails(getCaseDetails, runtimeData);

if ("Fulfill" === pxCurrentStageLabel) {
  console.log(`Match: Extracted text and Current Stage Label are the same -> ${extractedText}`); 
  await this.log(`Match: Extracted iframe text matches API Stage Label: <b>${extractedText}</b>`); 
} else {
  console.warn(`Mismatch: Extracted text = "${extractedText}", API stage = "${pxCurrentStageLabel}"`); 
  await this.logWithScreenshot(`Mismatch between UI and API<br>Extracted: ${extractedText}<br>API: ${pxCurrentStageLabel}`, this.page);
}
        if (elementHandle) {
            await frame.evaluate((el) => {
                const event = new MouseEvent('click', {
                    bubbles: true,
                    cancelable: true,
                    view: window
                });
                el.dispatchEvent(event);
            }, elementHandle);

            this.log('Clicked Begin button inside iframe via JS dispatchEvent');
        } else {
            await this.logWithScreenshot('Begin button not found inside iframe', this.page);
        }
        await this.wait(5);
        await this.verifyElementDisplayed(text_completeSearch, "Complete Search page");
 
        // await this.scrollIntoView(button_yes)
        await this.verifyElementDisplayed(button_yes, 'Button - Yes (To confirm that the search was successful');
        const uccResult = await this.executeUCCSearchTrue(uccSearchAPI, runtimeData);
        console.log(uccResult);
        if (uccResult && uccResult.IsUCCSearchComplete === 'true') {
            await this.log('UCC Search completed successfully via API.');
        } else {
            await this.logWithScreenshot('UCC Search API did not return expected result.', this.page);
        }
        await this.page.reload();
        await this.wait(5);
              const frame2 = await this.page.frame({ name: 'PegaGadget1Ifr' });
        if (!frame2) {
            await this.logWithScreenshot('Iframe not found', this.page);
            throw new Error('Iframe not available');
        }
 const actionType_result = frame2.locator(`xpath=${text_Results}`);
        console.log('Search Action exists in iframe?', !!(await actionType_result.elementHandle()));
        const resultsHandle = await frame2.$(`xpath=${text_Results}`);
let extractedText_results = '';

if (resultsHandle) {
  extractedText_results = (await textHandle.innerText()).trim();
  this.log(`Text extracted from iframe Search element: <b>${extractedText}</b>`);
} else {
  await this.logWithScreenshot('Result text element not found inside iframe', this.page);
}
// Compare the extracted text with pxCurrentStageLabel 
const { result_pxCurrentStageLabel } = await this.executeGetCaseDetails(getCaseDetails, runtimeData);

if (extractedText === result_pxCurrentStageLabel) {
  console.log(`Match: Extracted text and Current Stage Label are the same -> ${extractedText}`); 
  await this.log(`Match: Extracted iframe text matches API Stage Label: <b>${extractedText}</b>`); 
} else {
  console.warn(`Mismatch: Extracted text = "${extractedText}", API stage = "${result_pxCurrentStageLabel}"`); 
  await this.logWithScreenshot(`Mismatch between UI and API<br>Extracted: ${extractedText}<br>API: ${result_pxCurrentStageLabel}`, this.page);
}

await this.page
  .frameLocator('iframe[name="PegaGadget2Ifr"]')
  .locator(button_anytimeActions)
  .click();
await this.wait(3);

await this.page
  .frameLocator('iframe[name="PegaGadget2Ifr"]')
  .locator(option_Refresh)
  .click();

// Wait for page to load after Refresh
await this.page.waitForLoadState('networkidle');
await this.wait(3); // Additional buffer if needed

        }
}