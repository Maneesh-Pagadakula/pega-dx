import { PlaywrightActions } from '../setup/playwright-actions.js';
import { APIHelper } from '../helper-methods/APIHelper.js';
import { APIRequestExecutor } from '../helper-methods/APIRequestExecutor.js';
import { expect } from '@playwright/test';
import { HomePageObjects } from '../page-objects/home-page-objects.js';
import { orderFulfillmentPageObjects } from '../page-objects/order-fulfillment-page-objects.js';

export class UCCSearchFalse extends PlaywrightActions {
    constructor() {
        super();
        this.homePage = new HomePageObjects();
        this.orderFulfillmentPage = new orderFulfillmentPageObjects();
    }

    // Reuse from UCCSearchTrue
    async executeGetOrderDetails(api, runtimeData) {
        const { executeGetOrderDetails } = await import('./ucc-search-true.js');
        return (new (await import('./ucc-search-true.js')).UCCSearchTrue()).executeGetOrderDetails(api, runtimeData);
    }

    async executeGetCaseDetails(api, runtimeData) {
        return (new (await import('./ucc-search-true.js')).UCCSearchTrue()).executeGetCaseDetails(api, runtimeData);
    }

    async executeUCCSearchFalse(api, runtimeData) {
        try {
            const url = APIHelper.buildURL(api, runtimeData);
            const method = APIHelper.getRequestType(api);
            const headers = await APIHelper.getHeaders(api);
            const payload = await APIHelper.getRequestBody(api);

            await this.log(`API call prepared for 'UCC Search - False' → Method: ${method}, URL: ${url}`);
            console.log(`[LOG] API call prepared for 'UCC Search - False' - \n Method: ${method}, \n URL: ${url}`);

            const response = await APIRequestExecutor.post(url, headers, payload);
            const status = response.status;
            const responseBody = response.body;

            if (status === 200) {
                await this.log(`API call for 'UCC Search - False' was executed successfully with Status Code: ${status}`);
                console.log(`[LOG] API call for 'UCC Search - False' was executed successfully - \n Status Code: ${status}`);
                return responseBody;
            } else {
                console.warn(`[FAIL] Unexpected response returned - Status Code: ${status}`);
            }
        } catch (e) {
            await this.log(`Failed to hit the 'UCC Search - False' API: ${e.message}`);
            console.log(`[FAIL] UCC Search - False API failed - ${e.message}`);
        }
    }

    async UCCSearchUIValidation(orderId, groupId) {
        const {
            dropdown_launchPortal,
            option_caseWorker
        } = this.homePage;

        const {
            textbox_search,
            button_search,
            button_begin
        } = this.orderFulfillmentPage;

        await this.click(dropdown_launchPortal, 'Launch Portal (Rocket Icon)');
        this.wait(2);
        await this.clickAndSwitchToNewTab(option_caseWorker, 'Option - Case Worker');
        this.wait(5);

        await this.log('Navigated to Order Fulfillment page');
        console.log('Navigated to Order Fulfillment page');

        await this.click(textbox_search, 'Search Box');
        this.wait(2);
        await this.enterValue(textbox_search, orderId);
        this.wait(2);
        await this.click(button_search, 'Search Button');
        this.wait(5);

        const groupIdSelector = `//table[@class='gridTable ']//tr[contains(@class,'cellCont')]/td[5]/div//a[normalize-space(text())='${groupId}']`;
        await this.verifyElementDisplayed(groupIdSelector, `Group Id (${groupId})`);
        const groupId_from_ui = await this.getText(groupIdSelector, `Group Id (${groupId})`);
        console.log(`Group ID found in UI: ${groupId_from_ui}`);

        await this.click(groupIdSelector, 'Group Id Link');
        await this.wait(5);

        await this.verifyElementDisplayed(button_begin, 'Button - Begin');
        console.log(`[LOG] Navigated to Group Case - ${groupId}`);
    }
}
