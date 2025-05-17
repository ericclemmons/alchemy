import type { Context } from "../context.js";
import { Resource } from "../resource.js";
import { SentryApi } from "./api.js";

/**
 * Properties for creating or updating a Project
 */
export interface ProjectProps {
  /**
   * The name for the project
   */
  name: string;

  /**
   * Uniquely identifies a project and is used for the interface
   */
  slug?: string;

  /**
   * The platform for the project
   */
  platform?: string;

  /**
   * Whether to alert on every new issue
   */
  defaultRules?: boolean;

  /**
   * The team slug that owns the project
   */
  team: string;
}

/**
 * Output returned after Project creation/update
 */
export interface Project
  extends Omit<Resource<"sentry::Project">, "team">,
    Omit<ProjectProps, "team"> {
  /**
   * The ID of the project
   */
  id: string;

  /**
   * The team that owns the project
   */
  team: {
    id: string;
    name: string;
    slug: string;
  };

  /**
   * All teams that have access to the project
   */
  teams: Array<{
    id: string;
    name: string;
    slug: string;
  }>;

  /**
   * Whether the project is bookmarked
   */
  isBookmarked: boolean;

  /**
   * Whether the current user is a member of the project
   */
  isMember: boolean;

  /**
   * Access permissions for the project
   */
  access: string[];

  /**
   * Whether the current user has access to the project
   */
  hasAccess: boolean;

  /**
   * Time at which the project was created
   */
  dateCreated: string;

  /**
   * List of environments in the project
   */
  environments: string[];

  /**
   * Event processing status
   */
  eventProcessing: {
    symbolicationDegraded: boolean;
  };

  /**
   * List of features enabled for the project
   */
  features: string[];

  /**
   * Whether the project has received its first event
   */
  firstEvent: string | null;

  /**
   * Whether the project has received its first transaction event
   */
  firstTransactionEvent: boolean;

  /**
   * Whether the project has sessions
   */
  hasSessions: boolean;

  /**
   * Whether the project has profiles
   */
  hasProfiles: boolean;

  /**
   * Whether the project has replays
   */
  hasReplays: boolean;

  /**
   * Whether the project has flags
   */
  hasFlags: boolean;

  /**
   * Whether the project has monitors
   */
  hasMonitors: boolean;

  /**
   * Whether the project has feedback
   */
  hasFeedbacks: boolean;

  /**
   * Whether the project has new feedback
   */
  hasNewFeedbacks: boolean;

  /**
   * Whether the project has minified stack traces
   */
  hasMinifiedStackTrace: boolean;

  /**
   * Whether the project has HTTP insights
   */
  hasInsightsHttp: boolean;

  /**
   * Whether the project has database insights
   */
  hasInsightsDb: boolean;

  /**
   * Whether the project has asset insights
   */
  hasInsightsAssets: boolean;

  /**
   * Whether the project has app start insights
   */
  hasInsightsAppStart: boolean;

  /**
   * Whether the project has screen load insights
   */
  hasInsightsScreenLoad: boolean;

  /**
   * Whether the project has vitals insights
   */
  hasInsightsVitals: boolean;

  /**
   * Whether the project has cache insights
   */
  hasInsightsCaches: boolean;

  /**
   * Whether the project has queue insights
   */
  hasInsightsQueues: boolean;

  /**
   * Whether the project has LLM monitoring
   */
  hasInsightsLlmMonitoring: boolean;

  /**
   * List of platforms in the project
   */
  platforms: string[];

  /**
   * Latest release information
   */
  latestRelease: string | null;

  /**
   * Whether the project has user reports
   */
  hasUserReports: boolean;

  /**
   * Latest deployment information
   */
  latestDeploys: string | null;
}

/**
 * Create and manage Sentry projects
 *
 * @example
 * // Create a new project:
 * const project = await Project("my-project", {
 *   name: "My Project",
 *   slug: "my-project",
 *   platform: "node-express",
 *   team: "my-team"
 * });
 */
export const Project = Resource(
  "sentry::Project",
  async function (
    this: Context<Project>,
    id: string,
    props: ProjectProps,
  ): Promise<Project> {
    const api = new SentryApi();

    if (this.phase === "delete") {
      try {
        if (this.output?.id) {
          const response = await api.delete(
            `/projects/${api.organizationId}/${this.output.slug || this.output.id}`,
          );
          if (!response.ok && response.status !== 404) {
            console.error("Error deleting project:", response.statusText);
          }
        }
      } catch (error) {
        console.error("Error deleting project:", error);
      }
      return this.destroy();
    } else {
      try {
        let response;

        if (this.phase === "update" && this.output?.id) {
          response = await api.put(
            `/projects/${api.organizationId}/${this.output.slug || this.output.id}`,
            props,
          );
        } else {
          response = await api.post(
            `/teams/${api.organizationId}/${props.team}/projects`,
            props,
          );
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = (await response.json()) as Omit<
          Project,
          keyof ProjectProps
        > & { team: Project["team"] };
        return this({
          ...props,
          id: data.id,
          team: data.team,
          teams: data.teams,
          isBookmarked: data.isBookmarked,
          isMember: data.isMember,
          access: data.access,
          hasAccess: data.hasAccess,
          dateCreated: data.dateCreated,
          environments: data.environments,
          eventProcessing: data.eventProcessing,
          features: data.features,
          firstEvent: data.firstEvent,
          firstTransactionEvent: data.firstTransactionEvent,
          hasSessions: data.hasSessions,
          hasProfiles: data.hasProfiles,
          hasReplays: data.hasReplays,
          hasFlags: data.hasFlags,
          hasMonitors: data.hasMonitors,
          hasFeedbacks: data.hasFeedbacks,
          hasNewFeedbacks: data.hasNewFeedbacks,
          hasMinifiedStackTrace: data.hasMinifiedStackTrace,
          hasInsightsHttp: data.hasInsightsHttp,
          hasInsightsDb: data.hasInsightsDb,
          hasInsightsAssets: data.hasInsightsAssets,
          hasInsightsAppStart: data.hasInsightsAppStart,
          hasInsightsScreenLoad: data.hasInsightsScreenLoad,
          hasInsightsVitals: data.hasInsightsVitals,
          hasInsightsCaches: data.hasInsightsCaches,
          hasInsightsQueues: data.hasInsightsQueues,
          hasInsightsLlmMonitoring: data.hasInsightsLlmMonitoring,
          platforms: data.platforms,
          latestRelease: data.latestRelease,
          hasUserReports: data.hasUserReports,
          latestDeploys: data.latestDeploys,
        });
      } catch (error) {
        console.error("Error creating/updating project:", error);
        throw error;
      }
    }
  },
);
