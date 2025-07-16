import { PlaywrightActions } from '../setup/playwright-actions.js';
import { APIHelper } from '../helper-methods/APIHelper.js';
import { APIRequestExecutor } from '../helper-methods/APIRequestExecutor.js';
import { expect } from '@playwright/test';

export class GetCaseDetails extends PlaywrightActions {
  async executeGetCaseDetailsAPI(api, caseId) {
    try {
      const runtimeData = { caseId };
      const url = APIHelper.buildURL(api, runtimeData);
      const method = APIHelper.getRequestType(api);
      const headers = APIHelper.getHeaders(api);

      this.log(`Prepared Request to get case details for caseId: ${caseId} <br>URL: \`${url}\`<br>Method: \`${method}\``);

      const response = await APIRequestExecutor.get(url, headers);
      const responseCode = response.status;
      const responseBody = await response.text();
      const json = JSON.parse(responseBody);

      this.log(`Response from Get Case Details API <br>Status Code: ${responseCode}<br>Response Body: <br><pre>${JSON.stringify(json, null, 2)}</pre>`);

      expect(responseCode).toBe(200);

      const contentObject = json.content || {};
      expect(contentObject.SelectTypeOfPassport).toBeDefined();
      expect(contentObject.SelectTypeOfPassport).toBe("New");

      const responseCaseId = json.ID;
      expect(responseCaseId).toBe(caseId);
    } catch (e) {
      this.log(`API call failed with message - <br>${e.message}<br>, could not get case details`);
      throw new Error(`Workflow of fetching case details for caseId ${caseId} failed`);
    }
  }
}
