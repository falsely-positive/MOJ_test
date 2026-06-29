import { test as base, expect } from "@playwright/test";
import { HomePage } from "../pages/homePage";
import { LoginPage } from "../pages/loginPage";
import { AuthApi } from "../api/authApi";
import { BookingApi } from "../api/bookingApi";

type MyFixtures = {
  homePage: HomePage;
  loginPage: LoginPage;
  authApi: AuthApi;
  bookingApi: BookingApi;
};

export const test = base.extend<MyFixtures>({
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
  authApi: async ({ request }, use) => {
    const authApi = new AuthApi(request);
    await use(authApi);
  },
  bookingApi: async ({ request }, use) => {
    const bookingApi = new BookingApi(request);
    await use(bookingApi);
  },
});

export { expect };