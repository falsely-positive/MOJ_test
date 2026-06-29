import { expect, test } from "../../fixtures/test";
import { env } from "../../environments";
 
test.describe("Test Admin Login", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.pageload();
  }); 


    test("A valid user can log in to the admin area", async ({ loginPage }) => {
    await loginPage.login(env.users.admin.Username, env.users.admin.Password);
    expect(await loginPage.isLoggedIn()).toBe(true);
    }); 

    test("Invalid credentials are rejected with an error @login", async ({ loginPage }) => {
    await loginPage.attemptLogin(env.users.admin.Username, "wrong-password");

    await expect(loginPage.errorMessage).toBeVisible();
    expect(await loginPage.isLoggedIn()).toBe(false);
  });

    test("Admin is authenticated within 5 seconds @performance", async ({ loginPage }) => {
    const start = Date.now();
    await loginPage.login(env.users.admin.Username, env.users.admin.Password);
    const elapsed = Date.now() - start;

    expect(await loginPage.isLoggedIn()).toBe(true);
    expect(elapsed).toBeLessThanOrEqual(5000);
  });
});