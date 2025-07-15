import { PlaywrightActions } from '../setup/playwright-actions.js';
import { APIHelper } from '../helper-methods/APIHelper.js';
import { APIRequestExecutor } from '../helper-methods/APIRequestExecutor.js';
import { expect } from '@playwright/test';
import { HomePageObjects } from '../page-objects/home-page-objects.js';
import { orderFulfillmentPageObjects } from '../page-objects/order-fulfillment-page-objects.js';

export class UCCSearchTrue extends PlaywrightActions {
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

            await this.log(`API call prepared for 'Get Order Details' → Method: ${method}, URL: ${url}`);
            console.log(`[LOG] API call prepared for 'Get Order Details' - \n Method: ${method}, \n URL: ${url}`);

            const response = await APIRequestExecutor.get(url, headers);
            const statusCode = response.status;
            const responseBody = response.body;

            if (statusCode === 200) {
                await this.log(`API call for 'Get Order Details' was executed successfully with Status Code: ${statusCode}, Order ID: ${responseBody.ID}</b>`);
                console.log(`[LOG] API call for 'Get Order Details' was executed successfully - \n Status Code: ${statusCode}, \n Order ID: ${responseBody.ID}</b>`);

                const id = responseBody.ID;
                expect(id).not.toBeFalsy();
                await this.log(`Fetched Order ID: <b>${id}</b>`);
                console.log("[LOG] Extracted OrderID - " + id);

                const coveredKeysLogs = responseBody?.content?.pxCoveredInsKeys;
                console.log("[LOG] Extracted GroupId - " + coveredKeysLogs);

                if (Array.isArray(coveredKeysLogs) && coveredKeysLogs.length > 0) {
                    await this.log(`Extracted pxCoveredInsKeys from the response:<br><pre>${JSON.stringify(coveredKeysLogs, null, 2)}</pre>`);
                    console.log("[LOG] Extracted pxCoveredInsKeys from the response")
                } else {
                    await this.log("No pxCoveredInsKeys found in the response.");
                    console.log("[LOG] No pxCoveredInsKeys found in the response.");
                }

                // Return both id and groupId
                return {
                    id,
                    groupId: coveredKeysLogs
                };
            } else if (statusCode === 404 && responseBody.errors?.[0]?.message === 'Case not found for the given parameter ID') {
                await this.log(`API call for 'Get Order Details' failed with Status Code: ${statusCode}, Message: ${responseBody.errors?.[0]?.message}</b>`);
                console.log(`[FAIL] API call for 'Get Order Details' failed - \n Status Code: ${statusCode}, \n Message: ${responseBody.errors?.[0]?.message}`);
                return null;
            } else {
                console.log(`[FAIL] Unexpected response returned - \n Status Code${statusCode}`);
                return null;
            }


        } catch (e) {
            await this.log(`Failed to construct/hit the 'Get Order Details' API: ${e.message}`);
            console.log(`[FAIL] Get Order Details workflow failed - couldn't construct/hit the 'Get Order Details' API - \n ${e.message}`);
        }
    }

    async executeUCCSearchTrue(api, runtimeData) {
        try {
            if (!api) throw new Error('API config for UCC Search - True not found');
            const url = APIHelper.buildURL(api, runtimeData);
            const method = APIHelper.getRequestType(api); // <-- ADD THIS
            const headers = await APIHelper.getHeaders(api);
            const payload = await APIHelper.getRequestBody(api); // loads UCC Search - True.json

            await this.log(`API call prepared for 'UCC Search - True' → Method: ${method}, URL: ${url}`);
            console.log(`[LOG] API call prepared for 'UCC Search - True' - \n Method: ${method}, \n URL: ${url}`);

            const response = await APIRequestExecutor.post(url, headers, payload);
            const status = response.status;
            const responseBody = response.body;

            if (status === 200) {
                await this.log(`API call for 'UCC Search - True' was executed successfully with Status Code: ${statusCode}, Order ID: ${responseBody.ID}</b>`);
                console.log(`[LOG] API call for 'UCC Search - True' was executed successfully - \n Status Code: ${statusCode}, \n Order ID: ${responseBody.ID}</b>`);
                return responseBody;
            }
            if (statusCode === 404 && responseBody.errors?.[0]?.message === 'Assignment not found for the given parameter ID') {
                await this.log(`API call for 'UCC Search - True' failed with Status Code: ${statusCode}, Message: ${responseBody.errors?.[0]?.message}</b>`);
                console.log(`[FAIL] API call for 'UCC Search - True' failed - \n Status Code: ${statusCode}, \n Message: ${responseBody.errors?.[0]?.message}`)
            } else {
                console.log(`[FAIL] Unexpected response returned - \n Status Code${statusCode}`);
            }

        } catch (e) {
            await this.log(`Failed to construct/hit the 'UCC Search - True' API: ${e.message}`);
            console.log(`[FAIL] UCC Search - True workflow failed - couldn't construct/hit the 'UCC Search - true' API - \n ${e.message}`);
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

    async UCCSearchUIValidation(orderId, groupId, uccSearchAPI, runtimeData, getCaseDetails) {
        const {
            dropdown_launchPortal,
            option_caseWorker
        } = this.homePage;

        const {
            sidebarOption_search,
            container_iframe_search,
            iframe_searchpage,
            iframe_searchpage_identifier,
            textbox_caseId,
            button_open,
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

        await this.click(dropdown_launchPortal, 'Launch Portal (Rocket Icon)');
        this.wait(2);
        await this.clickAndSwitchToNewTab(option_caseWorker, 'Option - Case Worker');
        this.wait(5);
        await this.log('Successfully navigated to \"Order Fulfillment\" page');
        console.log('Navigated to "Order Fulfillment" page');
        this.wait(2);
        await this.click(sidebarOption_search, "Sidebar Option - Search");
        await this.wait(2);
        await this.verifyElementDisplayed(iframe_searchpage, 'iFrame - Search Page'); 
        await this.wait(2);
        const iframe_search = await this.switchToFrameInsideSelector(container_iframe_search, iframe_searchpage,iframe_searchpage_identifier);
        await this.wait(2);
        await this.ifVisibleClick(textbox_caseId, "Textbox - Case ID", 5, iframe_search);
        await this.enterValue(textbox_caseId, orderId, iframe_search);
        await this.ifVisibleClick(button_open, "Button - Open", 5, iframe_search);
        this.wait(2);

        await this.verifyElementDisplayed(button_begin, 'Button - Begin');
        console.log(`[LOG] Navigated successfully to 'Group Case - ${groupId}' page`);

        const frame = await this.page.frame({ name: 'PegaGadget1Ifr' });
        if (!frame) {
            await this.logWithScreenshot('Iframe not found', this.page);
            throw new Error('Iframe not available');
        }
        const btn = frame.locator(`xpath=${button_begin}`);
        console.log('[LOG] Begin Button Handle exists in iframe?', !!(await btn.elementHandle()));
        const elementHandle = await frame.$(`xpath=${button_begin}`);

        const actionType_Results = frame.locator(`xpath=${text_Results}`);
        console.log('[LOG] Results Action Type exists in iframe?', !!(await actionType_Results.elementHandle()));
        const textHandle = await frame.$(`xpath=${text_Results}`);

        let extractedText = '';

        if (textHandle) {
            extractedText = (await textHandle.innerText()).trim();
            this.log(`Text extracted from iframe Results element: <b>${extractedText}</b>`);
        } else {
            await this.logWithScreenshot('Results text element not found inside iframe', this.page);
        }
        // Compare the extracted text with pxCurrentStageLabel 
        const { pxCurrentStageLabel } = await this.executeGetCaseDetails(getCaseDetails, runtimeData);

        if (extractedText === pxCurrentStageLabel) {
            console.log(`Match: Extracted text and Current Stage Label are the same -> ${extractedText}`);
            await this.log(`Match: Extracted iframe text matches API Stage Label: <b>${extractedText}</b>`);
        } else {
            console.warn(`Mismatch: Extracted text = "${extractedText}", API stage = "${pxCurrentStageLabel}"`);
            await this.logWithScreenshot(`Mismatch between UI and API<br>Extracted: ${extractedText}<br>API: ${pxCurrentStageLabel}`, this.page);
        }
    }
}