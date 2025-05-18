import type { Context } from "../context.js";
import { Resource } from "../resource.js";
import { secret } from "../secret.js";
import { VercelApi } from "./api.js";

/**
 * Properties for creating or updating a ProjectDomain
 */
export interface ProjectDomainProps {
  /**
   * The domain name to add to the project
   */
  name: string;

  /**
   * The project ID to add the domain to
   */
  projectId: string;

  /**
   * The Git branch to link the domain to
   */
  gitBranch?: string;

  /**
   * The redirect target for the domain
   */
  redirect?: string;

  /**
   * The redirect status code
   */
  redirectStatusCode?: number;
}

/**
 * Output returned after ProjectDomain creation/update
 */
export interface ProjectDomain
  extends Resource<"vercel::ProjectDomain">,
    ProjectDomainProps {
  /**
   * The ID of the domain
   */
  id: string;

  /**
   * The time at which the domain was created
   */
  createdAt: number;

  /**
   * The time at which the domain was last updated
   */
  updatedAt: number;

  /**
   * Whether the domain is verified
   */
  verified: boolean;

  /**
   * The verification status of the domain
   */
  verification?: {
    /**
     * The type of verification
     */
    type: string;

    /**
     * The domain being verified
     */
    domain: string;

    /**
     * The verification value
     */
    value: string;

    /**
     * The reason for verification
     */
    reason?: string;
  }[];
}

/**
 * Create and manage Vercel project domains
 *
 * @example
 * // Add a domain to a project:
 * const domain = await ProjectDomain("my-app.com", {
 *   name: "my-app.com",
 *   projectId: "prj_123"
 * });
 *
 * @example
 * // Add a domain with Git branch and redirect:
 * const domain = await ProjectDomain("my-app.com", {
 *   name: "my-app.com",
 *   projectId: "prj_123",
 *   gitBranch: "main",
 *   redirect: "https://example.com",
 *   redirectStatusCode: 301
 * });
 */
export const ProjectDomain = Resource(
  "vercel::ProjectDomain",
  async function (
    this: Context<ProjectDomain>,
    id: string,
    props: ProjectDomainProps,
  ): Promise<ProjectDomain> {
    // Get API token from environment
    const token = process.env.VERCEL_TOKEN;
    if (!token) {
      throw new Error("VERCEL_TOKEN environment variable is required");
    }

    // Initialize API client
    const api = new VercelApi({
      baseUrl: "https://api.vercel.com/v9",
      token: secret(token).unencrypted,
    });

    if (this.phase === "delete") {
      try {
        if (this.output?.id) {
          // Delete domain
          const deleteResponse = await api.delete(
            `/projects/${props.projectId}/domains/${this.output.name}`,
          );

          // Check response status directly instead of relying on exceptions
          if (!deleteResponse.ok && deleteResponse.status !== 404) {
            console.error("Error deleting domain:", deleteResponse.statusText);
          }
        }
      } catch (error) {
        console.error("Error deleting domain:", error);
      }

      // Return destroyed state
      return this.destroy();
    } else {
      try {
        let response;

        if (this.phase === "update" && this.output?.id) {
          // Update existing domain
          response = await api.patch(
            `/projects/${props.projectId}/domains/${this.output.name}`,
            props,
          );
        } else {
          // Create new domain
          response = await api.post(
            `/projects/${props.projectId}/domains`,
            props,
          );
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
          verified: boolean;
          verification?: {
            type: string;
            domain: string;
            value: string;
            reason?: string;
          }[];
        };

        // Return the domain using this() to construct output
        return this({
          id: data.id,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          verified: data.verified,
          verification: data.verification,
          ...props,
        });
      } catch (error) {
        console.error("Error creating/updating domain:", error);
        throw error;
      }
    }
  },
);
