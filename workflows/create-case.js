import { PlaywrightActions } from '../setup/playwright-actions.js';
import { APIHelper } from '../helper-methods/APIHelper.js';
import { APIRequestExecutor } from '../helper-methods/APIRequestExecutor.js';
import { expect } from '@playwright/test';

export class CreateCase extends PlaywrightActions {
  async executeCreateCase(api) {
    try {
      const runtimeData = {};
      const url = APIHelper.buildURL(api, runtimeData);
      const method = APIHelper.getRequestType(api);
      let payload = APIHelper.getPayload(api);
      const headers = APIHelper.getHeaders(api);

      this.log(`Prepared Request for Create Case <br>URL: \`${url}\`<br>Method: \`${method}\`<br>Payload: <br><pre>${payload}</pre>`);
      
      const response = await APIRequestExecutor.post(url, headers, payload);
      console.log(response);
      const responseCode = response.status;
      const responseBody = await response.text();
      const json = JSON.parse(responseBody);

      this.log(`Response from Create Case API <br>Status Code: ${responseCode}<br>Response Body: <br><pre>${JSON.stringify(json, null, 2)}</pre>`);
      const caseId = json.ID;
      expect(caseId).not.toBeFalsy();
      this.log(`API call successful, a new case with <br>${caseId}<br> has been created`);

      return caseId;
    } catch (e) {
      this.log(`API call failed with message - <br>${e.message}<br>, could not create a new case`);
      console.log(e.message);
      throw new Error("Workflow of creating a new case using DX-API failed");
    }
  }
}
