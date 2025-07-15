import { PlaywrightActions } from '../setup/playwright-actions.js';
import { LoginPageObjects } from '../page-objects/login-page-objects.js';

export class LoginWorkflow extends PlaywrightActions {
  constructor() {
    super();
    this.loginElements = new LoginPageObjects();
  }

  async login(username, password) {
    await this.enterValue(this.loginElements.txtbox_username, username);
    await this.wait(2);
    await this.enterPassword(this.loginElements.txtbox_password, password);
    await this.wait(2);
    await this.click(this.loginElements.button_login, "Login Button");
    await this.wait(10);
  }
}
