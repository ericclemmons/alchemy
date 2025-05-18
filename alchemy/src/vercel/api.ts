/**
 * Options for Vercel API requests
 */
export interface VercelApiOptions {
  /**
   * API token to use (overrides environment variable)
   */
  token?: string;

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

  /** API token */
  readonly token: string;

  /** Team ID */
  readonly teamId: string;

  /**
   * Create a new API client
   *
   * @param options API options
   */
  constructor(options: VercelApiOptions = {}) {
    // Initialize with environment variables or provided values
    this.baseUrl = "https://api.vercel.com/v9";
    this.token = options.token || process.env.VERCEL_TOKEN || "";
    this.teamId = options.teamId || process.env.VERCEL_TEAM_ID || "";

    // Validate required configuration
    if (!this.token) {
      throw new Error("VERCEL_TOKEN environment variable is required");
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
      Authorization: `Bearer ${this.token}`,
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
