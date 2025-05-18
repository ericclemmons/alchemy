import type { Context } from "../context.js";
import { Resource } from "../resource.js";
import type { Secret } from "../secret.js";
import { createVercelApi } from "./api.js";

/**
 * Properties for creating or updating a Project
 */
export interface ProjectProps {
  /**
   * The name of the project
   */
  name: string;

  /**
   * The Git repository that will be connected to the project
   */
  gitRepository?: {
    /**
     * The type of Git repository
     */
    type: "github" | "gitlab" | "bitbucket";

    /**
     * The name of the Git repository
     */
    repo: string;
  };

  /**
   * The framework that is being used
   */
  framework?: string;

  /**
   * The build command for this project
   */
  buildCommand?: string;

  /**
   * The output directory of the build
   */
  outputDirectory?: string;

  /**
   * The install command for this project
   */
  installCommand?: string;

  /**
   * The development command for this project
   */
  devCommand?: string;

  /**
   * Command for ignoring build step
   */
  commandForIgnoringBuildStep?: string;

  /**
   * Whether to enable preview feedback
   */
  enablePreviewFeedback?: boolean;

  /**
   * Whether to enable production feedback
   */
  enableProductionFeedback?: boolean;

  /**
   * Whether to skip Git connect during link
   */
  skipGitConnectDuringLink?: boolean;

  /**
   * Whether the source is public
   */
  publicSource?: boolean;

  /**
   * The root directory of the project
   */
  rootDirectory?: string;

  /**
   * The serverless function region
   */
  serverlessFunctionRegion?: string;

  /**
   * Whether to enable serverless function zero config failover
   */
  serverlessFunctionZeroConfigFailover?: boolean;

  /**
   * OIDC token configuration
   */
  oidcTokenConfig?: {
    /**
     * Whether OIDC is enabled
     */
    enabled: boolean;

    /**
     * The issuer mode
     */
    issuerMode: "team";
  };

  /**
   * Whether to enable affected projects deployments
   */
  enableAffectedProjectsDeployments?: boolean;

  /**
   * Resource configuration
   */
  resourceConfig?: {
    /**
     * Whether fluid is enabled
     */
    fluid?: boolean;

    /**
     * Default regions for functions
     */
    functionDefaultRegions?: string[];

    /**
     * Default timeout for functions
     */
    functionDefaultTimeout?: number;

    /**
     * Default memory type for functions
     */
    functionDefaultMemoryType?: "standard_legacy";

    /**
     * Whether function zero config failover is enabled
     */
    functionZeroConfigFailover?: boolean;

    /**
     * Whether elastic concurrency is enabled
     */
    elasticConcurrencyEnabled?: boolean;

    /**
     * The build machine type
     */
    buildMachineType?: "enhanced";
  };

  /**
   * Environment variables for the project
   */
  environmentVariables?: Array<{
    /**
     * The key of the environment variable
     */
    key: string;

    /**
     * The target environment
     */
    target: "production" | "preview" | "development";

    /**
     * The Git branch
     */
    gitBranch?: string;

    /**
     * The type of environment variable
     */
    type: "system" | "secret" | "encrypted" | "plain";

    /**
     * The value of the environment variable
     */
    value: string;
  }>;
}

/**
 * Output returned after Project creation/update
 */
export interface Project extends Resource<"vercel::Project">, ProjectProps {
  /**
   * The ID of the project
   */
  id: string;

  /**
   * The account ID that the project belongs to
   */
  accountId: string;

  /**
   * The time at which the project was created
   */
  createdAt: number;

  /**
   * The time at which the project was last updated
   */
  updatedAt: number;

  /**
   * The latest deployment of the project
   */
  latestDeployment?: {
    /**
     * The ID of the deployment
     */
    id: string;

    /**
     * The URL of the deployment
     */
    url: string;
  };
}

/**
 * Create and manage Vercel projects
 *
 * @example
 * // Create a basic project:
 * const project = await Project("my-app", {
 *   name: "My App",
 *   framework: "nextjs"
 * });
 *
 * @example
 * // Create a project with Git integration:
 * const project = await Project("my-app", {
 *   name: "My App",
 *   framework: "nextjs",
 *   gitRepository: {
 *     type: "github",
 *     repo: "username/repo"
 *   }
 * });
 */
export const Project = Resource(
  "vercel::Project",
  async function (
    this: Context<Project>,
    id: string,
    props: ProjectProps & { accessToken?: Secret },
  ): Promise<Project> {
    const api = await createVercelApi({
      baseUrl: "https://api.vercel.com/v11",
      accessToken: props.accessToken,
    });

    if (this.phase === "delete") {
      try {
        if (this.output?.id) {
          // Delete project
          const deleteResponse = await api.delete(
            `/projects/${this.output.id}`,
          );

          // Check response status directly instead of relying on exceptions
          if (!deleteResponse.ok && deleteResponse.status !== 404) {
            console.error("Error deleting project:", deleteResponse.statusText);
          }
        }
      } catch (error) {
        console.error("Error deleting project:", error);
      }

      // Return destroyed state
      return this.destroy();
    } else {
      try {
        let response;

        if (this.phase === "update" && this.output?.id) {
          // Update existing project
          response = await api.patch(`/projects/${this.output.id}`, props);
        } else {
          // Create new project
          response = await api.post("/projects", props);
        }

        // Parse response JSON
        const data = (await response.json()) as {
          id: string;
          accountId: string;
          createdAt: number;
          updatedAt: number;
          latestDeployment?: {
            id: string;
            url: string;
          };
        };

        // Return the project using this() to construct output
        return this({
          id: data.id,
          accountId: data.accountId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          latestDeployment: data.latestDeployment,
          ...props,
        });
      } catch (error) {
        console.error("Error creating/updating project:", error);
        throw error;
      }
    }
  },
);
