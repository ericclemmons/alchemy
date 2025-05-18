import type { Context } from "../context.js";
import { Resource } from "../resource.js";
import type { Secret } from "../secret.js";
import { createVercelApi } from "./api.js";

/**
 * Properties for creating or updating a Project
 */
export interface ProjectProps {
  /**
   * The desired name for the project
   *
   * Maximum length: `100`
   * Example: `a-project-name`
   */
  name: string;

  /**
   * Opt-in to preview toolbar on the project level
   */
  enablePreviewFeedback?: boolean;

  /**
   * Opt-in to production toolbar on the project level
   */
  enableProductionFeedback?: boolean;

  /**
   * The build command for this project. When `null` is used this value will be automatically detected
   */
  buildCommand?: string;

  commandForIgnoringBuildStep?: string;

  /**
   * The dev command for this project. When `null` is used this value will be automatically detected
   */
  devCommand?: string;

  /**
   * Collection of ENV Variables the Project will use
   */
  environmentVariables?: Array<
    {
      /**
       * The key of the environment variable
       */
      key: string;

      /**
       * The target environment
       */
      target: ("production" | "preview" | "development")[];

      /**
       * The Git branch
       */
      gitBranch?: string;

      /**
       * The type of environment variable
       */
      type: "system" | "encrypted" | "plain" | "sensitive";

      /**
       * The value of the environment variable
       */
      value: Secret | string;
    } & (
      | { type: "system" | "plain"; value: string }
      | { type: "encrypted" | "sensitive"; value: Secret }
    )
  >;

  /**
   * The framework that is being used for this project. When `null` is used no framework is selected
   */
  framework?:
    | "blitzjs"
    | "nextjs"
    | "gatsby"
    | "remix"
    | "react-router"
    | "astro"
    | "hexo"
    | "eleventy"
    | "docusaurus-2"
    | "docusaurus"
    | "preact"
    | "solidstart-1"
    | "solidstart"
    | "dojo"
    | "ember"
    | "vue"
    | "scully"
    | "ionic-angular"
    | "angular"
    | "polymer"
    | "svelte"
    | "sveltekit"
    | "sveltekit-1"
    | "ionic-react"
    | "create-react-app"
    | "gridsome"
    | "umijs"
    | "sapper"
    | "saber"
    | "stencil"
    | "nuxtjs"
    | "redwoodjs"
    | "hugo"
    | "jekyll"
    | "brunch"
    | "middleman"
    | "zola"
    | "hydrogen"
    | "vite"
    | "vitepress"
    | "vuepress"
    | "parcel"
    | "fasthtml"
    | "sanity-v3"
    | "sanity"
    | "storybook"
    | (string & {});

  /**
   * The Git Repository that will be connected to the project. When this is defined, any pushes to the specified connected Git Repository will be automatically deployed
   */
  gitRepository?: {
    /**
     * The Git Provider of the repository
     */
    type: "github" | "gitlab" | "bitbucket";

    /**
     * The name of the git repository. For example: `vercel/next.js`
     */
    repo: string;
  };

  /**
   * The install command for this project. When `null` is used this value will be automatically detected
   */
  installCommand?: string;

  /**
   * The output directory of the build. When `null` is used this value will be automatically detected
   */
  outputDirectory?: string;

  /**
   * Specifies whether the source code and logs of the deployments for this project should be public or not
   */
  publicSource?: boolean;

  /**
   * The name of a directory or relative path to the source code of your project. When `null` is used it will default to the project root
   */
  rootDirectory?: string;

  /**
   * The region to deploy Serverless Functions in this project
   */
  serverlessFunctionRegion?: string;

  /**
   * Specifies whether Zero Config Failover is enabled for this project.
   */
  serverlessFunctionZeroConfigFailover?: boolean;

  /**
   * OpenID Connect JSON Web Token generation configuration.
   */
  oidcTokenConfig?: {
    /**
     * Whether or not to generate OpenID Connect JSON Web Tokens.
     */
    enabled: boolean;

    /**
     * team: `https://oidc.vercel.com/[team_slug]` global: `https://oidc.vercel.com`
     */
    issuerMode: "team" | "global";
  };

  /**
   * Opt-in to skip deployments when there are no changes to the root directory and its dependencies
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
    functionDefaultMemoryType?: "standard_legacy" | "standard" | "performance";

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
    buildMachineType?: "enhanced" | "ultra";
  };
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

export const Project = Resource(
  "vercel::Project",
  async function (
    this: Context<Project>,
    id: string,
    { accessToken, ...props }: ProjectProps & { accessToken?: Secret },
  ): Promise<Project> {
    switch (this.phase) {
      case "delete": {
        const api = await createVercelApi({
          baseUrl: "https://api.vercel.com/v9",
          accessToken,
        });

        try {
          if (this.output?.id) {
            const deleteResponse = await api.delete(
              `/projects/${this.output.id}`,
            );

            if (!deleteResponse.ok && deleteResponse.status !== 404) {
              console.error(
                "Error deleting project:",
                deleteResponse.statusText,
              );
            }
          }
        } catch (error) {
          console.error("Error deleting project:", error);
        }

        return this.destroy();
      }

      case "update": {
        const api = await createVercelApi({
          baseUrl: "https://api.vercel.com/v9",
          accessToken,
        });

        if (!this.output?.id) {
          throw new Error("Cannot update project without ID");
        }

        // 409 Conflict: Can't update name, so remove it from the props
        // 400 Invalid Request: Should NOT have additional property `environmentVariables`
        const { name, environmentVariables, ...rest } = props;

        const response = await api.patch(`/projects/${this.output.id}`, rest);
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

        if (environmentVariables) {
          const envApi = await createVercelApi({
            baseUrl: "https://api.vercel.com/v10",
            accessToken,
          });

          await envApi.post(
            `/projects/${this.output.id}/env?upsert=true`,
            environmentVariables.map((envVar) => ({
              ...envVar,
              value:
                envVar.type === "encrypted"
                  ? envVar.value.unencrypted
                  : envVar.value,
            })),
          );

          // Find previous env vars that are not in the new list and delete them
          const { envs } = (await envApi
            .get(`/projects/${this.output.id}/env`)
            .then((res) => res.json())) as {
            envs: Array<{ id: string; key: string }>;
          };
          for (const previousEnv of envs) {
            if (
              environmentVariables.some(
                (envVar) => envVar.key === previousEnv.key,
              )
            ) {
              continue;
            }

            await envApi.delete(
              `/projects/${this.output.id}/env/${previousEnv.id}`,
            );
          }
        }

        return this({
          id: data.id,
          accountId: data.accountId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          latestDeployment: data.latestDeployment,
          ...props,
        });
      }

      default: {
        const api = await createVercelApi({
          baseUrl: "https://api.vercel.com/v11",
          accessToken,
        });

        for (const envVar of props.environmentVariables ?? []) {
          if (envVar.type === "encrypted") {
            // @ts-expect-error - It's a secret, but Vercel needs the string
            envVar.value = envVar.value.unencrypted;
          }
        }

        const response = await api.post("/projects", props);
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

        return this({
          id: data.id,
          accountId: data.accountId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          latestDeployment: data.latestDeployment,
          environmentVariables: props.environmentVariables,
          ...props,
        });
      }
    }
  },
);
