import { UCCSearchTrue } from './ucc-search-true.js';
import { APIHelper } from '../helper-methods/APIHelper.js';
import { APIRequestExecutor } from '../helper-methods/APIRequestExecutor.js';

export class UCCSearchFalse extends UCCSearchTrue {

async executeUCCSearchFalse(api, runtimeData) {
    try {
      if (!api) throw new Error('API config for UCC Search - False not found');
      const url = APIHelper.buildURL(api, runtimeData);
      const method = APIHelper.getRequestType(api);
      const headers = await APIHelper.getHeaders(api);
      const payload = await APIHelper.getRequestBody(api); // UCC Search - False.json

      await this.log(`API call prepared for 'UCC Search - False' → Method: ${method}, URL: ${url}`);
      console.log(`[LOG] API call prepared for 'UCC Search - False' - \n Method: ${method}, \n URL: ${url}`);

      const response = await APIRequestExecutor.post(url, headers, payload);
      const status = response.status;
      const responseBody = response.body;

      if (status === 200) {
        await this.log(`API call for 'UCC Search - False' executed successfully → Status: ${status}, Order ID: ${responseBody.ID}`);
        console.log(`[LOG] API call for 'UCC Search - False' succeeded → Status: ${status}, Order ID: ${responseBody.ID}`);
        return responseBody;
      }

      const errorObj = responseBody?.errors?.[0];

      // ❌ 404: Assignment not found
      if (status === 404 && errorObj?.message === 'Assignment not found for the given parameter ID') {
        await this.log(`API call for 'UCC Search - False' failed → Status: ${status}, Message: ${errorObj.message}`);
        console.log(`[FAIL] API call for 'UCC Search - False' failed - ${errorObj.message}`);
      }

      // ⚠️ 400/404/422: Validation errors present
      if (errorObj?.ID === 'Pega_API_055' && Array.isArray(errorObj.ValidationMessages)) {
        for (const vm of errorObj.ValidationMessages) {
          const msg = vm.ValidationMessage;
          await this.log(`⚠️ Validation Message: <b>${msg}</b>`);
          console.log(`[VALIDATION] ${msg}`);
        }
      }

      // ✅ Extract ReasonUnableToObtain from fallback content
      const content = responseBody?.performAssignmentRequest?.content;
      if (content) {
        await this.log(`Fallback content received: ${JSON.stringify(content, null, 2)}`);
        console.log(`[INFO] Fallback content:\n${JSON.stringify(content, null, 2)}`);

        const reason = content.ReasonUnableToObtain;
        if (reason) {
          runtimeData.reasonUnableToObtain = reason;
          await this.log(`Extracted ReasonUnableToObtain from fallback content: <b>${reason}</b>`);
          console.log(`[LOG] Extracted ReasonUnableToObtain: ${reason}`);
        }
      }

      return null;
    } catch (e) {
      await this.log(`Failed to construct/hit the 'UCC Search - False' API: ${e.message}`);
      console.log(`[FAIL] UCC Search - False workflow failed → ${e.message}`);
    }
  }


  async UCCSearchUIValidation(groupId, runtimeData, getCaseDetailsAPI) {
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
      container_iframe_resultspage,
      iframe_resultspage,
      iframe_resultspage_identifier,
      text_awaitingCustomerResponse
    } = this.orderFulfillmentPage;

    this.wait(2);
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
    const iframe_search = await this.switchToFrameInsideSelector(container_iframe_search, iframe_searchpage, iframe_searchpage_identifier);
    await this.wait(2);
    await this.ifVisibleClick(textbox_caseId, "Textbox - Case ID", 5, iframe_search);
    await this.enterValue(textbox_caseId, groupId, iframe_search);
    await this.ifVisibleClick(button_open, "Button - Open", 5, iframe_search);
    this.wait(2);
    this.wait(8);

    const iframe_awaitingCustomerResponse = await this.switchToFrameInsideSelector(container_iframe_resultspage, iframe_resultspage, iframe_resultspage_identifier);
    this.wait(8);
    await this.verifyElementDisplayed(text_awaitingCustomerResponse, 'Text - Results (Current Stage)', iframe_awaitingCustomerResponse);
    const currentStage = await this.getText(text_awaitingCustomerResponse, "Text - Results (Current Stage)", iframe_awaitingCustomerResponse);
    console.log('[LOG] Is Results Action Type present in the current page?', !(!currentStage));
    await this.wait(2);

    if (currentStage === "Awaiting Customer Reponse") {
      console.log(`Match: Extracted text and Current Stage Label are the same -> ${currentStage}`);
      await this.log(`Match: Extracted iframe text matches API Stage Label: <b>${currentStage}</b>`);
    } else {
      console.warn(`Mismatch: Extracted text = "${currentStage}"`);
      await this.logWithScreenshot(`Mismatch between UI and API<br>Extracted: ${currentStage}<br>`, this.page);
    }

  }
}
