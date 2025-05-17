import type { Context } from "../context.js";
import { Resource } from "../resource.js";
import { SentryApi } from "./api.js";

/**
 * Properties for creating or updating a Team
 */
export interface TeamProps {
  /**
   * The name for the team
   */
  name: string;

  /**
   * Uniquely identifies a team and is used for the interface
   */
  slug?: string;
}

/**
 * Output returned after Team creation/update
 */
export interface Team extends Resource<"sentry::Team">, TeamProps {
  /**
   * The ID of the team
   */
  id: string;

  /**
   * Time at which the team was created
   */
  dateCreated: string;

  /**
   * Whether the current user is a member of the team
   */
  isMember: boolean;

  /**
   * The role of the current user in the team
   */
  teamRole: string;

  /**
   * Team flags
   */
  flags: {
    "idp:provisioned": boolean;
  };

  /**
   * Access permissions for the team
   */
  access: string[];

  /**
   * Whether the current user has access to the team
   */
  hasAccess: boolean;

  /**
   * Whether the team membership is pending
   */
  isPending: boolean;

  /**
   * Number of members in the team
   */
  memberCount: number;

  /**
   * Team avatar information
   */
  avatar: {
    avatarType: string;
    avatarUuid: string | null;
  };
}

/**
 * Create and manage Sentry teams
 *
 * @example
 * // Create a new team:
 * const team = await Team("my-team", {
 *   name: "My Team",
 *   slug: "my-team"
 * });
 */
export const Team = Resource(
  "sentry::Team",
  async function (
    this: Context<Team>,
    id: string,
    props: TeamProps,
  ): Promise<Team> {
    const api = new SentryApi();

    if (this.phase === "delete") {
      try {
        if (this.output?.id) {
          const response = await api.delete(
            `/teams/${api.organizationId}/${this.output.slug || this.output.id}`,
          );
          if (!response.ok && response.status !== 404) {
            console.error("Error deleting team:", response.statusText);
          }
        }
      } catch (error) {
        console.error("Error deleting team:", error);
      }
      return this.destroy();
    } else {
      try {
        let response;

        if (this.phase === "update" && this.output?.id) {
          response = await api.put(
            `/teams/${api.organizationId}/${this.output.slug || this.output.id}`,
            props,
          );
        } else {
          response = await api.post(`/teams/${api.organizationId}`, props);
        }

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const data = (await response.json()) as Omit<Team, keyof TeamProps>;
        return this({
          ...props,
          id: data.id,
          dateCreated: data.dateCreated,
          isMember: data.isMember,
          teamRole: data.teamRole,
          flags: data.flags,
          access: data.access,
          hasAccess: data.hasAccess,
          isPending: data.isPending,
          memberCount: data.memberCount,
          avatar: data.avatar,
        });
      } catch (error) {
        console.error("Error creating/updating team:", error);
        throw error;
      }
    }
  },
);
