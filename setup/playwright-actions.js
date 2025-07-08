// utils/PlaywrightActions.js
import { expect } from '@playwright/test';
import { PlaywrightEnvironmentSetup } from './playwright-environment-setup';

export class PlaywrightActions extends PlaywrightEnvironmentSetup {
  constructor() {
    super();
  }

  async enterValue(selector, valueToEnter) {
    try {
      await this.page.fill(selector, valueToEnter);
      this.log(`Entered value: ${valueToEnter}`);
    } catch (e) {
      await this.logWithScreenshot(`Failed to enter value: ${valueToEnter}<br>Exception: ${e.message}`, this.page);
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
    } catch (e) {
      await this.logWithScreenshot(`Failed to click on: ${elementName}<br>Exception: ${e.message}`, this.page);
    }
  }

  async jsClick(selector, elementName) {
    try {
      await this.page.$eval(selector, el => el.click());
      this.log(`JS clicked on: ${elementName}`);
    } catch (e) {
      await this.logWithScreenshot(`Failed to JS click on: ${elementName}<br>Exception: ${e.message}`, this.page);
    }
  }

  async verifyElementDisplayed(selector, elementName) {
    try {
      if (await this.page.locator(selector).isVisible()) {
        this.log(`Element displayed: ${elementName}`);
      }
    } catch (e) {
      await this.logWithScreenshot(`Element not displayed: ${elementName}<br>Exception: ${e.message}`, this.page);
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

  async getText(selector, elementName) {
    try {
      const text = (await this.page.textContent(selector)).trim();
      this.log(`Text from ${elementName}: ${text}`);
      return text;
    } catch (e) {
      await this.logWithScreenshot(`getText failed for ${elementName}: ${e.message}`, this.page);
      return null;
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
}
