import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./basePage";

export class LoginPage extends BasePage {
  readonly path = "/admin";

  private static readonly ADMIN_PATH = "/admin/rooms";

  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);

    this.usernameInput = page.locator("#username");
    this.passwordInput = page.locator("#password");
    this.loginButton = page.locator("#doLogin");
    this.errorMessage = page.locator(".alert-danger");
  }

  async pageload() {
    await this.goto();
    await expect(this.loginButton).toBeVisible();
  }

  async attemptLogin(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.attemptLogin(username, password);
    await this.page.waitForURL(LoginPage.ADMIN_PATH); 
  }

  async isLoggedIn(): Promise<boolean> {
    return this.page.url().includes(LoginPage.ADMIN_PATH);
  }
}
