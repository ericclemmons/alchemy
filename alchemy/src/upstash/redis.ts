import type { Context } from "../context.js";
import { Resource } from "../resource.js";

/**
 * Available regions for Upstash Redis databases
 */
export type UpstashRegion =
  | "us-east-1"
  | "us-west-1"
  | "us-west-2"
  | "eu-west-1"
  | "eu-central-1"
  | "ap-southeast-1"
  | "ap-southeast-2"
  | "ap-northeast-1"
  | "sa-east-1";

/**
 * Properties for creating or updating an UpstashRedis database
 */
export interface UpstashRedisProps {
  /**
   * Name of the database
   */
  name: string;

  /**
   * Primary region for the database
   */
  primaryRegion: UpstashRegion;

  /**
   * Read regions for the database
   */
  readRegions?: UpstashRegion[];

  /**
   * Monthly budget for the database
   */
  budget?: number;
}

/**
 * Output returned after UpstashRedis creation/update
 */
export interface UpstashRedis
  extends Resource<"upstash::Redis">,
    UpstashRedisProps {
  /**
   * ID of the database
   */
  id: string;

  /**
   * Type of the database in terms of pricing model
   */
  databaseType: string;

  /**
   * Region where database is hosted
   */
  region: "global";

  /**
   * Database port for clients to connect
   */
  port: number;

  /**
   * Creation time of the database as Unix time
   */
  createdAt: number;

  /**
   * State of database (active or deleted)
   */
  state: string;

  /**
   * Password of the database
   */
  password: string;

  /**
   * Email or team id of the owner of the database
   */
  userEmail: string;

  /**
   * Endpoint URL of the database
   */
  endpoint: string;

  /**
   * Whether TLS is enabled
   */
  tls: boolean;

  /**
   * REST token for the database
   */
  restToken: string;

  /**
   * Read-only REST token for the database
   */
  readOnlyRestToken: string;
}

/**
 * Options for Upstash API requests
 */
export interface UpstashApiOptions {
  /**
   * API key to use (overrides environment variable)
   */
  apiKey?: string;

  /**
   * Email to use (overrides environment variable)
   */
  email?: string;
}

/**
 * Response from Upstash API for database operations
 */
interface UpstashDatabaseResponse {
  database_id: string;
  database_name: string;
  database_type: string;
  region: "global";
  type: string;
  port: number;
  creation_time: number;
  state: string;
  password: string;
  user_email: string;
  endpoint: string;
  tls: boolean;
  rest_token: string;
  read_only_rest_token: string;
}

/**
 * Minimal API client using raw fetch
 */
export class UpstashApi {
  /** Base URL for API */
  readonly baseUrl: string;

  /** API key */
  readonly apiKey: string;

  /** Email */
  readonly email: string;

  /**
   * Create a new API client
   *
   * @param options API options
   */
  constructor(options: UpstashApiOptions = {}) {
    this.baseUrl = "https://api.upstash.com/v2";
    this.apiKey = options.apiKey || process.env.UPSTASH_API_KEY || "";
    this.email = options.email || process.env.UPSTASH_EMAIL || "";

    if (!this.apiKey) {
      throw new Error("UPSTASH_API_KEY environment variable is required");
    }

    if (!this.email) {
      throw new Error("UPSTASH_EMAIL environment variable is required");
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
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(`${this.email}:${this.apiKey}`)}`,
    };

    if (init.headers) {
      const initHeaders = init.headers as Record<string, string>;
      Object.keys(initHeaders).forEach((key) => {
        headers[key] = initHeaders[key];
      });
    }

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
    return this.fetch(path, {
      ...init,
      method: "POST",
      body: JSON.stringify(body),
    });
  }

  /**
   * Helper for DELETE requests
   */
  async delete(path: string, init: RequestInit = {}): Promise<Response> {
    return this.fetch(path, { ...init, method: "DELETE" });
  }
}

/**
 * Create and manage Upstash Redis databases
 *
 * @example
 * // Create a basic Redis database in us-east-1:
 * const redis = await UpstashRedis("my-redis", {
 *   name: "my-redis",
 *   primaryRegion: "us-east-1"
 * });
 *
 * @example
 * // Create a Redis database with read replicas:
 * const redis = await UpstashRedis("my-redis", {
 *   name: "my-redis",
 *   primaryRegion: "us-east-1",
 *   readRegions: ["us-west-1", "us-west-2"]
 * });
 *
 * @example
 * // Create a Redis database with a monthly budget:
 * const redis = await UpstashRedis("my-redis", {
 *   name: "my-redis",
 *   primaryRegion: "us-east-1",
 *   budget: 100
 * });
 */
export const UpstashRedis = Resource(
  "upstash::Redis",
  async function (
    this: Context<UpstashRedis>,
    id: string,
    props: UpstashRedisProps,
  ): Promise<UpstashRedis> {
    const api = new UpstashApi();

    if (this.phase === "delete") {
      try {
        if (this.output?.id) {
          const deleteResponse = await api.delete(
            `/redis/database/${this.output.id}`,
          );
          if (!deleteResponse.ok && deleteResponse.status !== 404) {
            console.error(
              "Error deleting database:",
              deleteResponse.statusText,
            );
          }
        }
      } catch (error) {
        console.error("Error deleting database:", error);
      }

      return this.destroy();
    } else {
      try {
        let response;

        if (this.phase === "update" && this.output?.id) {
          // Update existing database
          response = await api.post(`/redis/database/${this.output.id}`, {
            name: props.name,
            primary_region: props.primaryRegion,
            read_regions: props.readRegions,
            budget: props.budget,
          });
        } else {
          // Create new database
          response = await api.post("/redis/database", {
            name: props.name,
            region: "global",
            primary_region: props.primaryRegion,
            read_regions: props.readRegions,
            budget: props.budget,
            tls: true,
          });
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = (await response.json()) as UpstashDatabaseResponse;

        return this({
          id: data.database_id,
          name: data.database_name,
          databaseType: data.database_type,
          region: data.region,
          port: data.port,
          createdAt: data.creation_time,
          state: data.state,
          password: data.password,
          userEmail: data.user_email,
          endpoint: data.endpoint,
          tls: data.tls,
          restToken: data.rest_token,
          readOnlyRestToken: data.read_only_rest_token,
          primaryRegion: props.primaryRegion,
          readRegions: props.readRegions,
          budget: props.budget,
        });
      } catch (error) {
        console.error("Error creating/updating database:", error);
        throw error;
      }
    }
  },
);
