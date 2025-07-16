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
      const statusCode = response.status;
      const responseBody = response.body;

      if (statusCode === 200) {
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
    const headers = await APIHelper.getHeaders(api);

    await this.log(`API call prepared for 'Get Case Details' → Method: ${method}, URL: ${url}`);
    console.log(`[LOG] API call prepared for 'Get Case Details' - \n Method: ${method}, \n URL: ${url}`);

    const response = await APIRequestExecutor.get(url, headers);
    const statusCode = response.status;
    const responseBody = response.body;

    if (statusCode === 200) {
      await this.log(`API call for 'Get Case Details' executed with Status Code: ${statusCode}`);
      console.log(`[LOG] 'Get Case Details' successful - Status Code: ${statusCode}`);

      const stageLabel = responseBody?.content?.pxCurrentStageLabel;
      const lineCaseId = responseBody?.content?.SelectedOrderLineList?.[0]?.pyID;
      const caseStatus = responseBody?.status;
      if (stageLabel) {
        await this.log(`Fetched Current Stage Label: <b>${stageLabel}</b>`);
        console.log(`[LOG] pxCurrentStageLabel: ${stageLabel}`);
      }

      if (lineCaseId) {
        await this.log(`Fetched Line Case ID: <b>${lineCaseId}</b>`);
        console.log(`[LOG] Line Case ID (pyID): ${lineCaseId}`);
      }
      
      if (caseStatus) {
  console.log(`[LOG] Case Status from API: ${status}`);
  await this.log(`Fetched Case Status from API: <b>${status}</b>`);
}

      return {
        pxCurrentStageLabel: stageLabel || null,
        lineCaseId: lineCaseId || null
      };

    } else if (statusCode === 404) {
      const error = responseBody.errors?.[0]?.message;
      await this.log(`API call for 'Get Case Details' failed with 404 - ${error}`);
      console.warn(`[FAIL] 'Get Case Details' returned 404 - ${error}`);
      return null;
    } else {
      await this.log(`Unexpected status code: ${statusCode}`);
      console.warn(`[FAIL] Unexpected status code from 'Get Case Details': ${statusCode}`);
      return null;
    }

  } catch (e) {
    await this.log(`Exception in 'Get Case Details': ${e.message}`);
    console.error(`[ERROR] Exception in 'Get Case Details': ${e.message}`);
    return null;
  }
}


  async executeGetAttachmentID(api, runtimeData) {
    try {
      const url = APIHelper.buildURL(api, runtimeData);
      const method = APIHelper.getRequestType(api);
      const headers = await APIHelper.getHeaders(api);
      const fileData = await APIHelper.getRequestBody(api); // returns { filePath, fieldName }

      await this.log(`API call prepared for 'Get Attachment ID' → Method: ${method}, URL: ${url}`);
      console.log(`[LOG] API call prepared for 'Get Attachment ID' - \n Method: ${method}, \n URL: ${url}`);

      if (!fileData || !fileData.filePath) {
        console.log(`[WARN] File path missing or invalid. Skipping upload.`);
        return null;
      }

      const response = await APIRequestExecutor.postFormDataWithFile(
        url,
        headers,
        fileData.filePath,
        fileData.fieldName
      );

      const status = response.status;
      const responseBody = response.body;

      if (status === 201 && responseBody?.ID) {
        await this.log(`Attachment upload succeeded → Status: ${status}, ID: ${responseBody.ID}`);
        console.log(`[LOG] Attachment uploaded → Status: ${status}, ID: ${responseBody.ID}`);
        return responseBody.ID;
      } else {
        await this.log(`Attachment upload failed → Status: ${status}, Body: ${JSON.stringify(responseBody)}`);
        console.log(`[FAIL] Attachment upload failed → Status: ${status}`);
        return null;
      }

    } catch (e) {
      await this.log(`Failed to upload attachment: ${e.message} ${e.response}`);
      console.log(`[FAIL] Get Attachment ID workflow failed: ${e.message}`);
      return null;
    }
  }

  async executeUploadAttachment(api, runtimeData, attachmentId) {
    try {
      if (!attachmentId) {
        console.warn('[WARN] Attachment ID is missing. Skipping Upload Attachment API.');
        await this.log(`[WARN] Attachment ID missing. Skipping upload.`);
        return;
      }

      const url = APIHelper.buildURL(api, runtimeData);
      const method = APIHelper.getRequestType(api);
      const headers = await APIHelper.getHeaders(api);
      const payload = await APIHelper.getRequestBody(api); // Load Upload Attachment.json

      if (!payload?.attachments?.[0]) {
        console.warn('[FAIL] Upload Attachment JSON is malformed.');
        return;
      }

      // Inject the fresh ID into payload
      payload.attachments[0].ID = attachmentId;

      await this.log(`Uploading attachment to → ${url} with payload - ${JSON.stringify(payload)}`);
      console.log(`Uploading attachment to → ${url} with payload - ${JSON.stringify(payload)}`);
      const response = await APIRequestExecutor.post(url, headers, payload);
      const status = response.status;
      const responseBody = response.body;

      if (status === 201) {
        await this.log(`Attachment successfully uploaded. Status: ${status}`);
        console.log(`[LOG] Attachment uploaded. Status: ${status}`);
      } else if (status === 404 && responseBody?.errorDetails?.[0]?.message === "Error_File_Not_Found") {
        await this.log(`Attachment upload failed. Attachment ID not found → ${attachmentId}`);
        console.log(`[FAIL] Invalid Attachment ID. Couldn't find file for ID: ${attachmentId}`);
      } else {
        await this.log(`Upload Attachment failed → Status: ${status}, Body: ${JSON.stringify(responseBody)}`);
        console.log(`[FAIL] Upload Attachment failed. Status: ${status}`);
      }

    } catch (e) {
      await this.log(`Upload Attachment workflow failed: ${e.message}`);
      console.log(`[FAIL] Upload Attachment Exception - ${e.message}`);
    }
  }

async executeSubmitLineCase(api, runtimeData, lineCaseId) {
  try {
    if (!lineCaseId) {
      const msg = `[ERROR] No Line Case ID provided. Cannot submit line case.`;
      await this.log(msg);
      console.error(msg);
      return;
    }

    runtimeData['lineCaseId'] = lineCaseId;

    const url = APIHelper.buildURL(api, runtimeData);
    const method = APIHelper.getRequestType(api);
    const headers = await APIHelper.getHeaders(api);
    const payload = await APIHelper.getRequestBody(api);

    await this.log(`Submitting Line Case ID → ${lineCaseId} using payload: <pre>${JSON.stringify(payload, null, 2)}</pre>`);
    console.log(`[LOG] Submitting Line Case (pyID: ${lineCaseId} on Endpoint: ${url}`);

    const response = await APIRequestExecutor.post(url, headers, payload);
    const statusCode = response.status;
    const responseBody = response.body;

    if (statusCode === 200) {
      await this.log(`Line case submitted successfully. Next Page: ${responseBody.nextPageID}`);
      console.log(`[PASS] Line case submitted successfully. Next Page: ${responseBody.nextPageID}`);
    } else if (statusCode === 404) {
      const error = responseBody.errors?.[0]?.message;
      await this.log(`[FAIL] Submit Line Case failed - ${error}`);
      console.warn(`[FAIL] Submit Line Case failed - ${error}`);
    } else {
      await this.log(`[FAIL] Unexpected error while submitting line case → Status: ${statusCode}`);
      console.warn(`[FAIL] Submit Line Case returned unexpected status: ${statusCode}`);
    }

  } catch (e) {
    await this.log(`[ERROR] Exception during Submit Line Case: ${e.message}`);
    console.error(`[ERROR] Exception in 'Submit Line Case': ${e.message}`);
  }
}

async executeSubmitResultStage(api, runtimeData) {
  try {
    if (!runtimeData.groupId) {
      const msg = `[ERROR] No Group ID provided. Cannot submit results stage.`;
      await this.log(msg);
      console.error(msg);
      return;
    }

    const url = APIHelper.buildURL(api, runtimeData);
    const method = APIHelper.getRequestType(api);
    const headers = await APIHelper.getHeaders(api);
    const payload = await APIHelper.getRequestBody(api); // Can be empty or {} for some endpoints

    await this.log(`Submitting Result Stage (Group ID → ${runtimeData.groupId}) on URL: ${url}`);
    console.log(`[LOG] Submitting Result Stage using payload - ${url}`);

    const response = await APIRequestExecutor.post(url, headers, payload);
    const status = response.status;
    const responseBody = response.body;

    if (status === 200 || status === 201) {
      await this.log(`Result stage submitted successfully. Status: ${status}`);
      console.log(`[PASS] API to Result stage was submitted successfully → Status: ${status}`);
    } else {
      await this.log(`Failed to submit result stage. Status: ${status}, Body: ${JSON.stringify(responseBody)}`);
      console.warn(`[FAIL] Unexpected response during Submit Result Stage → Status: ${status}`);
    }

  } catch (e) {
    await this.log(`[ERROR] Exception in Submit Result Stage: ${e.message}`);
    console.error(`[ERROR] Exception in Submit Result Stage: ${e.message}`);
  }
}
async executeValidateFeesTrue(api, runtimeData) {
  try {
    if (!api) {
      const msg = `[ERROR] API configuration for 'Validate Fees - True' not found.`;
      await this.log(msg);
      console.error(msg);
      return;
    }

    const url = APIHelper.buildURL(api, runtimeData);
    const method = APIHelper.getRequestType(api);
    const headers = await APIHelper.getHeaders(api);
    const payload = await APIHelper.getRequestBody(api); // Loads 'Fees Valid - True.json'

    await this.log(`API call prepared for 'Validate Fees - True' → Method: ${method}, URL: ${url}`);
    console.log(`[LOG] API call prepared for 'Validate Fees - True' - \n Method: ${method}, \n URL: ${url}`);

    const response = await APIRequestExecutor.post(url, headers, payload);
    const statusCode = response.status;
    const responseBody = response.body;

    if (statusCode === 200 || statusCode === 201) {
      await this.log(`'Validate Fees - True' succeeded → Status: ${statusCode}`);
      console.log(`[PASS] 'Validate Fees - True' succeeded → Status: ${statusCode}`);
    } else if (statusCode === 404) {
      const error = responseBody.errors?.[0]?.message || 'Not Found';
      await this.log(`[FAIL] 'Validate Fees - True' returned 404 - ${error}`);
      console.warn(`[FAIL] 'Validate Fees - True' returned 404 - ${error}`);
    } else {
      await this.log(`[FAIL] 'Validate Fees - True' returned unexpected status → ${statusCode}, Body: ${JSON.stringify(responseBody)}`);
      console.warn(`[FAIL] 'Validate Fees - True' failed → Status: ${statusCode}`);
    }

  } catch (e) {
    await this.log(`[ERROR] Exception in 'Validate Fees - True': ${e.message}`);
    console.error(`[ERROR] Exception in 'Validate Fees - True': ${e.message}`);
  }
}

async executeInvoicingFailure(api, runtimeData) {
  try {
    if (!api) {
      const msg = `[ERROR] API configuration for 'Invoicing Failure' not found.`;
      await this.log(msg);
      console.error(msg);
      return;
    }

    const url = APIHelper.buildURL(api, runtimeData);
    const method = APIHelper.getRequestType(api);
    const headers = await APIHelper.getHeaders(api);
    const payload = await APIHelper.getRequestBody(api); // usually empty or `{}`

    await this.log(`API call prepared for 'Invoicing Failure' → Method: ${method}, URL: ${url}`);
    console.log(`[LOG] API call prepared for 'Invoicing Failure' - \n Method: ${method}, \n URL: ${url}`);

    const response = await APIRequestExecutor.post(url, headers, payload);
    const statusCode = response.status;
    const responseBody = response.body;

    if (statusCode === 200 || statusCode === 201) {
      await this.log(`'Invoicing Failure' succeeded → Status: ${statusCode}`);
      console.log(`[PASS] 'Invoicing Failure' succeeded → Status: ${statusCode}`);
    } else if (statusCode === 404 && responseBody?.errors?.[0]?.message === "Assignment not found for the given parameter ID") {
      await this.log(`[FAIL] 'Invoicing Failure' returned 404 - Assignment not found.`);
      console.warn(`[FAIL] 'Invoicing Failure' returned 404 - Assignment not found.`);
    } else {
      await this.log(`[FAIL] Unexpected status from 'Invoicing Failure' → Status: ${statusCode}, Body: ${JSON.stringify(responseBody)}`);
      console.warn(`[FAIL] Unexpected status from 'Invoicing Failure' → Status: ${statusCode}`);
    }

  } catch (e) {
    await this.log(`[ERROR] Exception in 'Invoicing Failure': ${e.message}`);
    console.error(`[ERROR] Exception in 'Invoicing Failure': ${e.message}`);
  }
}


  async UCCSearchUIValidation(groupId, uploadAttachmentAPI, runtimeData, attachmentId, getCaseDetailsAPI, submitLineCaseAPI, submitResultsStageAPI, feesValidAPI, invoicingFaliureAPI) {
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
      container_iframe_anytimeActions,
      iframe_anytimeActions,
      iframe_anytimeActions_identifier,
      container_attachments,
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
    await this.verifyElementDisplayed(button_begin, 'Button - Begin');
    console.log(`[LOG] Navigated successfully to 'Group Case - ${groupId}' page`);
    this.wait(8);
    const iframe_results = await this.switchToFrameInsideSelector(container_iframe_resultspage, iframe_resultspage, iframe_resultspage_identifier);
    this.wait(8);
    await this.verifyElementDisplayed(text_Results, 'Text - Results (Current Stage)', iframe_results);
    const currentStage = await this.getText(text_Results, "Text - Results (Current Stage)", iframe_results);
    console.log('[LOG] Is Results Action Type is present in the current page?', !(!currentStage));
 await this.wait(2);
  
    const { pxCurrentStageLabel, lineCaseId } = await this.executeGetCaseDetails(getCaseDetailsAPI, runtimeData);

    if (currentStage === pxCurrentStageLabel) {
      console.log(`Match: Extracted text and Current Stage Label are the same -> ${currentStage}`);
      await this.log(`Match: Extracted iframe text matches API Stage Label: <b>${currentStage}</b>`);
    } else {
      console.warn(`Mismatch: Extracted text = "${currentStage}", API stage = "${pxCurrentStageLabel}"`);
      await this.logWithScreenshot(`Mismatch between UI and API<br>Extracted: ${currentStage}<br>API: ${pxCurrentStageLabel}`, this.page);
    }

    this.wait(8);
    const iframe_anytimeActionsButton = iframe_results;
    await this.wait(2);

    const initialAttachmentCount = await this.getElementCount(container_attachments, "Attachments Conatiner", iframe_anytimeActionsButton);
    console.log(`[LOG] Initial Attachment Count: ${initialAttachmentCount}`);
    await this.log(`Initial Attachment Count: <b>${initialAttachmentCount}</b>`);
    await this.wait(2);
    await this.executeUploadAttachment(uploadAttachmentAPI, runtimeData, attachmentId);
    await this.verifyElementDisplayed(button_anytimeActions, 'Button - Anytime Actions', iframe_anytimeActionsButton);
    await this.ifVisibleClick(button_anytimeActions, 'Button - Anytime Actions', 5, iframe_anytimeActionsButton);
    await this.wait(5);
    await this.verifyElementDisplayed(option_Refresh, 'Option - Refresh (Anytime Action)', iframe_anytimeActionsButton);
    await this.ifVisibleClick(option_Refresh, 'Option - Refresh (Anytime Action)', 5, iframe_anytimeActionsButton);
    await this.wait(8);
const refreshedIframe = await this.switchToFrameInsideSelector(container_iframe_resultspage, iframe_resultspage, iframe_resultspage_identifier);

    const updatedAttachmentCount = await this.getElementCount(container_attachments, "Attachments Conatiner", refreshedIframe);
    console.log(`[LOG] Updated Attachment Count: ${updatedAttachmentCount}`);
    await this.log(`Updated Attachment Count: <b>${updatedAttachmentCount}</b>`);

    // Assert
    if (updatedAttachmentCount > initialAttachmentCount) {
      console.log(`[PASS] Attachment uploaded successfully. Count increased from ${initialAttachmentCount} to ${updatedAttachmentCount}`);
      await this.log(`Attachment count increased from <b>${initialAttachmentCount}</b> to <b>${updatedAttachmentCount}</b>`);
    } else {
      console.warn(`[FAIL] Attachment upload might have failed. Count stayed at ${initialAttachmentCount}`);
      await this.logWithScreenshot(`Attachment count did NOT increase after upload.<br>Before: ${initialAttachmentCount}<br>After: ${updatedAttachmentCount}`, this.page);
    }
    await this.executeSubmitLineCase(submitLineCaseAPI, runtimeData, lineCaseId);
    await this.executeSubmitResultStage(submitResultsStageAPI, runtimeData);
    await this.executeValidateFeesTrue(feesValidAPI, runtimeData);
    await this.wait(2);
    await this.executeInvoicingFailure(invoicingFaliureAPI, runtimeData);
    await this.wait(2);
    await this.verifyElementDisplayed(button_anytimeActions, 'Button - Anytime Actions', refreshedIframe);
    await this.ifVisibleClick(button_anytimeActions, 'Button - Anytime Actions', 5, refreshedIframe);
    await this.wait(5);
    await this.verifyElementDisplayed(option_Refresh, 'Option - Refresh (Anytime Action)', refreshedIframe);
    await this.ifVisibleClick(option_Refresh, 'Option - Refresh (Anytime Action)', 5, refreshedIframe);
    await this.wait(8);


    // await this.verifyElementDisplayed(button_begin, 'Button - Begin', iframe_results);
    // await this.ifVisibleClick(button_begin, "Button - Button", 5, iframe_results);
    // await this.wait(5);

  }
}