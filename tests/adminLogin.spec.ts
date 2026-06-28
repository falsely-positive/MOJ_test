import { expect, test } from "../fixtures/test";
import { LoginPage } from "../pages/loginPage";
import { env } from "../environments";
 
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
});