import { APIRequestContext, APIResponse } from "@playwright/test";
import { env } from "../environments";

/**
 * Service object for the auth endpoint — the API equivalent of a Page Object.
 * Encapsulates the endpoint path and request shape so specs stay free of raw URLs.
 */
export class AuthApi {
  private readonly path = env.apiURL + "/auth/login";

  constructor(private readonly request: APIRequestContext) {}

  async login(username: string, password: string): Promise<APIResponse> {
    return this.request.post(this.path, {
      data: { username, password },
    });
  }

  /** Log in and return just the auth token (for use as a cookie on other calls). */
  async getToken(username: string, password: string): Promise<string> {
    const response = await this.login(username, password);
    const body = await response.json();
    return body.token;
  }
}
