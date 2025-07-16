// utils/PlaywrightActions.js
import { expect } from '@playwright/test';
import { PlaywrightEnvironmentSetup } from './playwright-environment-setup';

export class PlaywrightActions extends PlaywrightEnvironmentSetup {
  constructor() {
    super();
  }

  async enterValue(selector, valueToEnter, targetContext = this.page) {
  try {
    const context = targetContext || this.page;
    await context.fill(selector, valueToEnter);

    await this.log(`Entered value: <b>${valueToEnter}</b>`);
    console.log(`[LOG] Entered value: ${valueToEnter}`);
  } catch (e) {
    await this.logWithScreenshot(`Failed to enter value: <b>${valueToEnter}</b><br>Exception: ${e.message}`, targetContext || this.page);
    console.log(`[FAIL] Failed to enter value - ${valueToEnter} due to ${e.message}`);
  }
}


  async enterPassword(selector, passwordValue) {
    await this.enterValue(selector, passwordValue);
    this.log("Entered Password successfully");
  }

  async jsType(selector, valueToEnter) {
    try {
      await this.page.$eval(selector, (el, value) => { el.value = value; }, valueToEnter);
      await this.logWithScreenshot(`JS typed value: ${valueToEnter}`, this.page);
    } catch (e) {
      await this.logWithScreenshot(`Failed to JS type value: ${valueToEnter}<br>Exception: ${e.message}`, this.page);
    }
  }

  async ifDisplayClick(selector, elementName) {
    try {
      const element = this.page.locator(selector);
      if (await element.isVisible()) {
        await element.click();
        this.log(`Clicked on: ${elementName}`);
      } else {
        this.log(`Element not visible: ${elementName}`);
      }
    } catch (e) {
      await this.logWithScreenshot(`Failed to click: ${elementName}<br>Exception: ${e.message}`, this.page);
    }
  }

  async click(selector, elementName) {
    try {
      await this.page.click(selector);
      this.log(`Clicked on: ${elementName}`);
      console.log(`[LOG] Clicked on: ${elementName}`);
    } catch (e) {
      await this.logWithScreenshot(`Failed to click on: ${elementName}<br>Exception: ${e.message}`, this.page);
      console.log(`[FAIL] Couldn't click on - ${elementName} due to ${e.message}`);
    }
  }

  async jsClick(selector, elementName) {
    // try {
    //   await this.page.$eval(selector, el => el.click());
    //   this.log(`JS clicked on: ${elementName}`);
    // } catch (e) {
    //   await this.logWithScreenshot(`Failed to JS click on: ${elementName}<br>Exception: ${e.message}`, this.page);
    // }
    try {
      await this.page.$eval(selector, el => {
        const event = new MouseEvent('click', {
          bubbles: true,
          cancelable: true,
          view: window
        });
        el.dispatchEvent(event);
      });
      this.log(`Enhanced JS clicked on: ${elementName}`);
    } catch (e) {
      await this.logWithScreenshot(`Enhanced JS click failed for: ${elementName}<br>Exception: ${e.message}`, this.page);
    }
  }

async getText(selector, elementName, targetContext = this.page) {
  try {
    const context = targetContext || this.page;
    const text = (await context.textContent(selector))?.trim();

    this.log(`Text from ${elementName}: ${text}`);
    console.log(`[LOG] Extracted text - ${elementName}: ${text}`);

    return text;
  } catch (e) {
    await this.logWithScreenshot(`getText failed for ${elementName}: ${e.message}`, targetContext || this.page);
    console.log(`[FAIL] Failed to extract text from - ${elementName} due to ${e.message}`);
    return null;
  }
}
async verifyElementDisplayed(selector, elementName, targetContext = this.page) {
  try {
    const context = targetContext || this.page;
    const isVisible = await context.locator(selector).isVisible();

    if (isVisible) {
      this.log(`Element displayed: ${elementName}`);
      console.log(`[LOG] Element displayed: ${elementName}`);
    } else {
      this.log(`Element NOT displayed: ${elementName}`);
      console.warn(`[WARN] Element NOT displayed: ${elementName}`);
    }

    return isVisible;
  } catch (e) {
    await this.logWithScreenshot(`Element not displayed: ${elementName}<br>Exception: ${e.message}`, targetContext || this.page);
    console.log(`[FAIL] Failed to check visibility of element - ${elementName} due to ${e.message}`);
    return false;
  }
}


  async validateByText(selector, expectedText) {
    try {
      const locator = this.page.locator(selector);
      await locator.waitFor({ timeout: 20000 });
      const actualText = (await locator.textContent()).trim();
      if (expectedText === actualText) {
        this.log(`Text matched: ${expectedText}`);
      } else {
        await this.logWithScreenshot(`Expected: ${expectedText}, but got: ${actualText}`, this.page);
      }
    } catch (e) {
      await this.logWithScreenshot(`Failed to match text: ${expectedText}<br>Exception: ${e.message}`, this.page);
    }
  }

  async wait(seconds) {
    await new Promise(resolve => setTimeout(resolve, seconds * 1000));
  }

  async scrollPageDown(pixels = 250) {
    await this.page.evaluate(p => window.scrollBy(0, p), pixels);
  }

  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async scrollIntoView(selector) {
    try {
      await this.page.locator(selector).scrollIntoViewIfNeeded();
      this.log(`Scrolled element into view: ${selector}`);
    } catch (e) {
      await this.logWithScreenshot(`Scroll failed: ${e.message}`, this.page);
    }
  }

  async verifyElementIsVisible(selector, elementName) {
    try {
      const visible = await this.page.locator(selector).isVisible();
      if (visible) this.log(`Element visible: ${elementName}`);
      return visible;
    } catch (e) {
      await this.logWithScreenshot(`Visibility check failed for ${elementName}: ${e.message}`, this.page);
      return false;
    }
  }


  async getValue(selector, elementName) {
    try {
      const value = await this.page.locator(selector).inputValue();
      this.log(`Value from ${elementName}: ${value}`);
      return value;
    } catch (e) {
      await this.logWithScreenshot(`getValue failed for ${elementName}: ${e.message}`, this.page);
      return null;
    }
  }

  async verifyButtonIsSelected(selector, elementName, selectedClass) {
    try {
      const classAttr = await this.page.locator(selector).getAttribute('class');
      const selected = classAttr && classAttr.includes(selectedClass);
      if (selected) this.log(`Button selected: ${elementName}`);
      return selected;
    } catch (e) {
      await this.logWithScreenshot(`verifyButtonIsSelected failed for ${elementName}: ${e.message}`, this.page);
      return false;
    }
  }

  async mouseHover(selector, elementName) {
    try {
      await this.page.locator(selector).hover();
      this.log(`Hovered over: ${elementName}`);
    } catch (e) {
      await this.logWithScreenshot(`Hover failed for ${elementName}: ${e.message}`, this.page);
    }
  }

  async doubleClick(selector, elementName) {
    try {
      await this.page.locator(selector).dblclick();
      this.log(`Double-clicked: ${elementName}`);
    } catch (e) {
      await this.logWithScreenshot(`Double-click failed for ${elementName}: ${e.message}`, this.page);
    }
  }

  async switchToNewPage() {
    try {
      const newPagePromise = this.page.context().waitForEvent('page');
      // You must trigger the new tab popup before awaiting this
      const newPage = await newPagePromise;
      this.page = newPage;
      await this.logWithScreenshot('Switched to new page', this.page);
    } catch (e) {
      await this.logWithScreenshot(`Switch page failed: ${e.message}`, this.page);
    }
  }

  async refreshPage() {
    await this.page.reload();
    await this.logWithScreenshot('Page refreshed', this.page);
  }

  loggerMethod(msg1, msg2) {
    this.log(`${msg1}: ${msg2}`);
  }

  regularExpressionMatcher(text, regex, elementName) {
    const match = new RegExp(regex).test(text);
    if (match) this.log(`Regex matched for ${elementName}`);
    else this.logWithScreenshot(`Regex didn't match for ${elementName}`, this.page);
    return match;
  }

  async selectByVisibleText(selector, value, elementName) {
    try {
      await this.page.selectOption(selector, { label: value });
      this.log(`Selected ${value} in ${elementName}`);
    } catch (e) {
      await this.logWithScreenshot(`Dropdown select failed for ${elementName}: ${e.message}`, this.page);
    }
  }

  async getElements(selector) {
    return await this.page.locator(selector).all();
  }

  async highlightAndScreenshotCaseRow(selector, linkText = '') {
    try {
      const formattedSelector = linkText ? selector.replace('%s', linkText) : selector;

      await this.page.$eval(formattedSelector, el => {
        el.style.outline = '3px solid red';
        setTimeout(() => el.style.outline = '', 2000);
      });

      await this.logWithScreenshot(`Element${linkText ? ` with text "${linkText}"` : ''} has been highlighted`, this.page);
    } catch (e) {
      await this.logWithScreenshot(`Failed to highlight or screenshot: ${e.message}`, this.page);
    }
  }

  extractCaseId(text) {
    if (!text) return null;
    const match = text.match(/PASSPORT-\d+/);
    return match ? match[0] : null;
  }

  fillPlaceholder(locator, value) {
    return value && value.trim() ? locator.replace('%s', value) : locator;
  }

  async waitForElement(selector, elementName, time) {
    try {
      await this.page.waitForSelector(selector, {
        state: 'visible',
        timeout: time * 1000
      });
      await this.log(`Element visible: ${elementName}`);
    } catch (e) {
      await this.logWithScreenshot(`Element not visible: ${elementName}<br>Exception: ${e.message}`, this.page);
      throw new Error(`Timeout waiting for element: ${elementName}`);
    }
  }
  async clickAndSwitchToNewTab(selector, elementName) {
    try {
      const newPagePromise = this.page.context().waitForEvent('page');
      await this.page.click(selector); // triggers new tab
      await this.wait(5);

      const newPage = await newPagePromise;

      await newPage.waitForLoadState('domcontentloaded');
      await newPage.waitForLoadState('networkidle');
      this.page = newPage;

      await this.log(`Switched to new page with URL: ${newPage.url()}`);
      console.log(`[LOG] Clicked and switched to the active tab with the URL - ${newPage.url()}`)
    } catch (e) {
      await this.logWithScreenshot(`Failed to switch after clicking '${elementName}': ${e.message}`, this.page);
       console.log(`[FAIL] Failed to click and switch to the active tab due to ${e.message}`)
      throw e;
    }
  }



  async switchBackToPreviousTab() {
    try {
      if (this.pageStack.length > 0) {
        this.page = this.pageStack.pop(); // go back
        await this.logWithScreenshot('Switched back to previous tab', this.page);
      } else {
        this.log('No previous tab to switch back to');
      }
    } catch (e) {
      await this.logWithScreenshot(`Failed to switch back: ${e.message}`, this.page);
    }
  }

  async closeCurrentTabAndSwitchBack() {
    try {
      await this.page.close();
      this.log('Closed current tab');
      await this.switchBackToPreviousTab();
    } catch (e) {
      await this.logWithScreenshot(`Failed to close and switch back: ${e.message}`, this.page);
    }
  }

  async switchToFrameByNameOrTitle(identifier) {
  try {
    await this.log(`Attempting to switch to frame using identifier: <b>${identifier}</b>`);
    console.log(`[LOG] Attempting to switch to frame: ${identifier}`);

    let frame = this.page.frame({ name: identifier });

    // Fallback: find by partial match in all frames
    if (!frame) {
      const frames = this.page.frames();
      frame = frames.find(f =>
        f.name()?.includes(identifier)
      );
    }

    if (!frame) {
      await this.logWithScreenshot(`Frame not found with identifier: <b>${identifier}</b>`, this.page);
      console.log(`[FAIL] No frame found using identifier: ${identifier}`);
      return null;
    }

    await this.log(`witched to frame: <b>${identifier}</b>`);
    console.log(`[LOG] Successfully switched to frame: ${identifier}`);
    return frame;

  } catch (e) {
    await this.logWithScreenshot(`Error while switching to frame <b>${identifier}</b>: ${e.message}`, this.page);
    console.log(`[FAIL] Error occured when trying to switch to frame - ${identifier} due to ${e.message}`);
    return null;
  }
}
async switchToFrameInsideSelector(containerSelector, iframeSelector, frameName = '') {
  try {
    await this.log(`Looking for iframe inside: <b>${containerSelector}</b>`);
    const container = this.page.locator(containerSelector);

    await container.waitFor({ state: 'visible', timeout: 50000 });

    const iframeElement = container.locator(iframeSelector);
    await iframeElement.waitFor({ state: 'attached', timeout: 50000 });

    const elementHandle = await iframeElement.elementHandle();
  const frame = await elementHandle?.contentFrame();


    if (!frame) {
      await this.logWithScreenshot(`Failed to retrieve frame object inside ${containerSelector}`, this.page);
      console.log(`[FAIL] Couldn't get frame object inside container: ${containerSelector}`);
      return null;
    }

    await this.log(`Switched to iframe ${frameName || 'inside selector'}`);
    console.log(`[LOG] Successfully switched to iframe ${frameName || ''} inside: ${containerSelector}`);
    return frame;

  } catch (e) {
    await this.logWithScreenshot(`Error while switching to iframe inside <b>${containerSelector}</b>: ${e.message}`, this.page);
    console.log(`[FAIL] Error while switching to iframe inside ${containerSelector}: ${e.message}`);
    return null;
  }
}

async switchFromFrameToFrame(currentIdentifier, targetIdentifier) {
  try {
    await this.log(`Switching from frame <b>${currentIdentifier}</b> to <b>${targetIdentifier}</b>`);
    console.log(`[LOG] Switching from frame - ${currentIdentifier} to frame - ${targetIdentifier}`);

    const currentFrame = await this.switchToFrameByNameOrTitle(currentIdentifier);
    if (!currentFrame) {
      await this.log(`Current frame not found: <b>${currentIdentifier}</b>. Cannot switch.`);
      console.log(`[FAIL] Current frame not found: ${currentIdentifier}`);
      return null;
    }

    const targetFrame = await this.switchToFrameByNameOrTitle(targetIdentifier);
    if (!targetFrame) {
      await this.log(`Target frame not found: <b>${targetIdentifier}</b>. Cannot complete switch.`);
      console.log(`[FAIL] Target frame not found: ${targetIdentifier}`);
      return null;
    }

    await this.log(`Switched from <b>${currentIdentifier}</b> to <b>${targetIdentifier}</b>`);
    console.log(`[LOG] Successfully switched to target frame: ${targetIdentifier}`);
    return targetFrame;

  } catch (e) {
    await this.logWithScreenshot(`Error while switching frames from <b>${currentIdentifier}</b> to <b>${targetIdentifier}</b>: ${e.message}`, this.page);
    console.log(`[FAIL] Error while switching frames - ${e.message}`);
    return null;
  }
}

async switchBackToMainPage() {
  try {
    await this.log('Attempting to switch back to the main page (detach from any iframe)');
    console.log('[LOG] Attempting to switch back to the main page');

    const mainFrame = this.page.mainFrame();

    if (mainFrame) {
      await this.log('Switched back to the main page context');
      console.log('[LOG] Main page context is now active');
      return mainFrame;
    } else {
      await this.logWithScreenshot('Main page frame not found while switching back', this.page);
      console.log('[FAIL] Main frame was not found');
      return null;
    }

  } catch (e) {
    await this.logWithScreenshot(`Error while switching back to main page: ${e.message}`, this.page);
    console.log(`[FAIL] Error while switching back to main page - ${e.message}`);
    return null;
  }
}

async ifVisibleClick(selector, elementName, timeoutInSeconds = 5, targetContext = this.page) {
  try {
    const context = targetContext || this.page;
    const element = context.locator(selector);

    const isVisible = await element.isVisible({ timeout: timeoutInSeconds * 1000 });

    if (isVisible) {
      await element.click();
      await this.log(`✅ Clicked on visible element: <b>${elementName}</b>`);
      console.log(`[LOG] Clicked on visible element: ${elementName}`);
    } else {
      await this.log(`⚠️ Element not visible: <b>${elementName}</b>. Skipping click.`);
      console.log(`[WARN] Element not visible: ${elementName}`);
    }
  } catch (e) {
    await this.logWithScreenshot(`❌ Failed to click on: <b>${elementName}</b><br>Exception: ${e.message}`, targetContext || this.page);
    console.log(`[FAIL] Failed to click on ${elementName} due to ${e.message}`);
  }
}

async getElementCount(selector, elementName, targetContext = this.page) {
  try {
    const context = targetContext || this.page;
    const element = context.locator(selector);

    const count = await element.count();
    await this.log(`Count for <b>${elementName}</b>: ${count}`);
    console.log(`[LOG] Count for ${elementName}: ${count}`);
    return count;
  } catch (e) {
    await this.logWithScreenshot(`Failed to get count for: <b>${elementName}</b><br>Exception: ${e.message}`, targetContext || this.page);
    console.log(`[FAIL] Failed to get count for ${elementName} due to ${e.message}`);
    return 0;
  }
}

}
