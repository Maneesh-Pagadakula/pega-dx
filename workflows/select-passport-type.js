import { PlaywrightActions } from '../setup/playwright-actions.js';
import { PassportRegistrationPageObjects } from '../page-objects/passport-registration-page-objects.js';
import { HomePageObjects } from '../page-objects/home-page-objects.js';
import { APIHelper } from '../helper-methods/APIHelper.js';
import { APIRequestExecutor } from '../helper-methods/APIRequestExecutor.js';
import { expect } from '@playwright/test';

export class SelectPassportType extends PlaywrightActions {
  constructor() {
    super();
    this.homePageObjects = new HomePageObjects();
    this.passportRegistrationObjects = new PassportRegistrationPageObjects();
    this.id = null;
  }

  async executeSelectPassportType(api, caseId) {
    try {
      const runtimeData = { caseId };
      const url = APIHelper.buildURL(api, runtimeData);
      const method = APIHelper.getRequestType(api);
      const payload = APIHelper.getPayload(api);
      const headers = APIHelper.getHeaders(api);

      this.log(`Prepared Request to select passport type<br>URL: \`${url}\`<br>Method: \`${method}\``);

      const response = await APIRequestExecutor.post(url, headers, payload);
      const responseCode = response.status;
      const responseBody = await response.text();
      const json = JSON.parse(responseBody);

      this.log(`Response from Select Passport Type API <br>Status Code: ${responseCode}<br>Response Body: <br><pre>${JSON.stringify(json, null, 2)}</pre>`);

      const nextPageId = json.nextPageID;
      expect(nextPageId).not.toBeFalsy();

      this.log(`API call successful, passport type set to "New" for CaseId - <br>${caseId}`);
      this.id = caseId;
    } catch (e) {
      this.log(`API call failed with message - <br>${e.message}<br>, could not select the passport type`);
      throw new Error(`Workflow for selecting passport type for caseId ${caseId} failed`);
    }
  }

  async validatePassportType() {
    await this.click(this.fillPlaceholder(this.homePageObjects.button_go, this.extractCaseId(this.id)), 'Go Button');
    await this.wait(3);
    this.log("Navigated to Passport Registration Page");
    await this.scrollIntoView(this.passportRegistrationObjects.dataRow_selectPassportType);
    await this.wait(3);
    await this.highlightAndScreenshotCaseRow(this.page, this.passportRegistrationObjects.dataRow_selectPassportType);
  }
}
