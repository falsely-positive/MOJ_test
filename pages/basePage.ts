import { Page } from "@playwright/test";

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  getPage(): Page {
    return this.page;
  }

  abstract readonly path: string;

  async goto(): Promise<void> {
    await this.page.goto(this.path);
    await this.waitForLoaded();
  }

  protected async waitForLoaded(): Promise<void> {
    await this.page.waitForLoadState("domcontentloaded");
  }
}
