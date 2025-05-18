import type { Context } from "../context.js";
import { Resource } from "../resource.js";
import { VercelApi } from "./api.js";

/**
 * Properties for creating or updating a ProjectEnv
 */
export interface ProjectEnvProps {
  /**
   * The project ID to add the environment variable to
   */
  projectId: string;

  /**
   * The key of the environment variable
   */
  key: string;

  /**
   * The value of the environment variable
   */
  value: string;

  /**
   * The type of environment variable
   */
  type: "plain" | "secret";

  /**
   * The target environments for the variable
   */
  target: ("production" | "preview" | "development")[];

  /**
   * The Git branch to link the variable to
   */
  gitBranch?: string;
}

/**
 * Output returned after ProjectEnv creation/update
 */
export interface ProjectEnv
  extends Resource<"vercel::ProjectEnv">,
    ProjectEnvProps {
  /**
   * The ID of the environment variable
   */
  id: string;

  /**
   * The time at which the environment variable was created
   */
  createdAt: number;

  /**
   * The time at which the environment variable was last updated
   */
  updatedAt: number;
}

/**
 * Create and manage Vercel project environment variables
 *
 * @example
 * // Add a plain environment variable:
 * const env = await ProjectEnv("DATABASE_URL", {
 *   projectId: "prj_123",
 *   key: "DATABASE_URL",
 *   value: "postgres://user:pass@localhost:5432/db",
 *   type: "plain",
 *   target: ["production", "preview"]
 * });
 *
 * @example
 * // Add a secret environment variable:
 * const env = await ProjectEnv("API_KEY", {
 *   projectId: "prj_123",
 *   key: "API_KEY",
 *   value: "sk_live_123",
 *   type: "secret",
 *   target: ["production"]
 * });
 *
 * @example
 * // Add an environment variable for a specific Git branch:
 * const env = await ProjectEnv("FEATURE_FLAG", {
 *   projectId: "prj_123",
 *   key: "FEATURE_FLAG",
 *   value: "true",
 *   type: "plain",
 *   target: ["preview"],
 *   gitBranch: "feature/new-ui"
 * });
 */
export const ProjectEnv = Resource(
  "vercel::ProjectEnv",
  async function (
    this: Context<ProjectEnv>,
    id: string,
    props: ProjectEnvProps,
  ): Promise<ProjectEnv> {
    // Get API token from environment
    const token = process.env.VERCEL_TOKEN;
    if (!token) {
      throw new Error("VERCEL_TOKEN environment variable is required");
    }

    // Initialize API client
    const api = new VercelApi();

    if (this.phase === "delete") {
      try {
        if (this.output?.id) {
          // Delete environment variable
          const deleteResponse = await api.delete(
            `/projects/${props.projectId}/env/${this.output.id}`,
          );

          // Check response status directly instead of relying on exceptions
          if (!deleteResponse.ok && deleteResponse.status !== 404) {
            console.error(
              "Error deleting environment variable:",
              deleteResponse.statusText,
            );
          }
        }
      } catch (error) {
        console.error("Error deleting environment variable:", error);
      }

      // Return destroyed state
      return this.destroy();
    } else {
      try {
        let response;

        if (this.phase === "update" && this.output?.id) {
          // Update existing environment variable
          response = await api.patch(
            `/projects/${props.projectId}/env/${this.output.id}`,
            props,
          );
        } else {
          // Create new environment variable
          response = await api.post(`/projects/${props.projectId}/env`, props);
        }

        // Check response status directly
        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        // Parse response JSON
        const data = (await response.json()) as {
          id: string;
          createdAt: number;
          updatedAt: number;
        };

        // Return the environment variable using this() to construct output
        return this({
          id: data.id,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          ...props,
        });
      } catch (error) {
        console.error("Error creating/updating environment variable:", error);
        throw error;
      }
    }
  },
);
