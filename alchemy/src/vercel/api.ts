import { alchemy } from "../alchemy.js";
import type { Secret } from "../secret.js";

/**
 * Options for Vercel API requests
 */
export interface VercelApiOptions {
  /**
   * Base URL for API
   */
  baseUrl: string;

  /**
   * API access token to use (overrides environment variable)
   */
  accessToken?: Secret;

  /**
   * Team ID (overrides environment variable)
   */
  teamId?: string;
}

/**
 * Minimal API client using raw fetch
 */
export class VercelApi {
  /** Base URL for API */
  readonly baseUrl: string;

  /** API access token */
  readonly accessToken: Secret;

  /** Team ID */
  readonly teamId: string;

  /**
   * Create a new API client
   *
   * @param options API options
   */
  constructor(options: VercelApiOptions) {
    // Initialize with environment variables or provided values
    this.baseUrl = options.baseUrl;
    this.accessToken =
      options.accessToken || alchemy.secret(process.env.VERCEL_ACCESS_TOKEN);
    this.teamId = options.teamId || process.env.VERCEL_TEAM_ID || "";

    // Validate required configuration
    if (!this.accessToken) {
      throw new Error("VERCEL_ACCESS_TOKEN environment variable is required");
    }
  }

  /**
   * Make a request to the API
   *
   * @param path API path (without base URL)
   * @param init Fetch init options
   * @returns Raw Response object from fetch
   */
  async fetch(path: string, init: RequestInit = {}): Promise<Response> {
    // Set up authentication headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.accessToken.unencrypted}`,
    };

    // Add team ID if present
    if (this.teamId) {
      headers["x-team-id"] = this.teamId;
    }

    // Add headers from init if provided
    if (init.headers) {
      const initHeaders = init.headers as Record<string, string>;
      Object.keys(initHeaders).forEach((key) => {
        headers[key] = initHeaders[key];
      });
    }

    // For FormData, remove Content-Type
    if (init.body instanceof FormData) {
      delete headers["Content-Type"];
    }

    // Make the request
    return fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });
  }

  /**
   * Helper for GET requests
   */
  async get(path: string, init: RequestInit = {}): Promise<Response> {
    return this.fetch(path, { ...init, method: "GET" });
  }

  /**
   * Helper for POST requests
   */
  async post(
    path: string,
    body: any,
    init: RequestInit = {},
  ): Promise<Response> {
    const requestBody = body instanceof FormData ? body : JSON.stringify(body);
    return this.fetch(path, { ...init, method: "POST", body: requestBody });
  }

  /**
   * Helper for PUT requests
   */
  async put(
    path: string,
    body: any,
    init: RequestInit = {},
  ): Promise<Response> {
    const requestBody = body instanceof FormData ? body : JSON.stringify(body);
    return this.fetch(path, { ...init, method: "PUT", body: requestBody });
  }

  /**
   * Helper for PATCH requests
   */
  async patch(
    path: string,
    body: any,
    init: RequestInit = {},
  ): Promise<Response> {
    const requestBody = body instanceof FormData ? body : JSON.stringify(body);
    return this.fetch(path, { ...init, method: "PATCH", body: requestBody });
  }

  /**
   * Helper for DELETE requests
   */
  async delete(path: string, init: RequestInit = {}): Promise<Response> {
    return this.fetch(path, { ...init, method: "DELETE" });
  }
}
