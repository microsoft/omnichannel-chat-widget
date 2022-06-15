import { Page } from "playwright";
import fs from "fs";
import { CustomLiveChatWidgetConstants } from "e2e/utility/constants";

export class BasePage {
  protected isBaseClosed = false;
  constructor(protected _page: Page) {}

  public get Page(): Page {
      return this._page;
  }

  public set Page(page: Page) {
      this._page = page;
  }

  public async closePage() {
      if (this.isBaseClosed) {
          return;
      }
      await this._page.close();
      this.isBaseClosed = true;
  }

  public async scrollTo(selector: string) {
      await this.Page.evaluate(
          (param) => {
              document.querySelector(param.selector).scrollIntoView();
          },
          { selector: selector }
      );
  }

  public async openLiveChatWidget() {
      const path = fs.realpathSync(CustomLiveChatWidgetConstants.CustomLiveChatWidgetFilePath);
      await this.Page.goto("file://" + path, { waitUntil: "domcontentloaded" });
  }

  public async waitUntilLiveChatSelectorIsVisible(
      selectorVal: string,
      maxCount = 3,
      page: Page = null,
      timeout: number = CustomLiveChatWidgetConstants.DefaultTimeout
  ) {
      let dataCount = 0;
      const pageObject = page ?? this.Page;
      while (dataCount < maxCount) {
          try {
              await pageObject.waitForSelector(selectorVal, { timeout });
              return true;
          } catch {
              dataCount++;
          }
      }
      return false;
  }

  public async retry(cpage: Page, callback, count: number, delayMS: number) {
      await retry(cpage, callback, count, delayMS);
  }
}

// This method required to arbitrarily wait and get all system messages to wait needed system message when it appears
const retry = async (cpage: Page, callback, count: number, delayMS: number) => {
    while (count != 0) {
        try {
            await callback();
            return;
            // eslint-disable-next-line no-empty
        } catch (error) {
        } finally {
            count--;
            await cpage.waitForTimeout(delayMS);
        }
    }
};
