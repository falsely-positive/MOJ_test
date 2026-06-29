import { expect, test } from "../../fixtures/test";
import { env } from "../../environments";

test.describe("Auth API", () => {
  test("Valid credentials return a token within 5 seconds @performance", async ({
    authApi,
  }) => {
    const start = Date.now();
    const response = await authApi.login(
      env.users.admin.Username,
      env.users.admin.Password,
    );
    const elapsed = Date.now() - start;

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.token).toBeTruthy();
    expect(elapsed).toBeLessThanOrEqual(5000);
  });

  test("Invalid credentials are rejected with 401 and no token", async ({
    authApi,
  }) => {
    const response = await authApi.login(env.users.admin.Username, "wrong-password");

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.token).toBeUndefined();
  });
});
