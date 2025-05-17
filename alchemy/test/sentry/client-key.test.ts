import { describe, expect } from "bun:test";
import { alchemy } from "../../src/alchemy.js";
import { destroy } from "../../src/destroy.js";
import { SentryApi } from "../../src/sentry/api.js";
import { ClientKey } from "../../src/sentry/client-key.js";
import { Project } from "../../src/sentry/project.js";
import { Team } from "../../src/sentry/team.js";
import "../../src/test/bun.js";
import { BRANCH_PREFIX } from "../util.js";

const api = new SentryApi();

const test = alchemy.test(import.meta);

describe("ClientKey Resource", () => {
  const testId = `${BRANCH_PREFIX}-test-key`;
  const projectId = `${BRANCH_PREFIX}-test-project`;
  const teamId = `${BRANCH_PREFIX}-test-team`;

  test("create, update, and delete client key", async (scope) => {
    let clientKey: ClientKey | undefined;
    let project: Project | undefined;
    let team: Team | undefined;

    try {
      // First create a team and project since client key requires a project
      team = await Team(teamId, {
        name: `Test Team ${teamId}`,
        slug: teamId,
      });

      if (!team.slug) {
        throw new Error("Team slug is required");
      }

      project = await Project(projectId, {
        name: `Test Project ${projectId}`,
        slug: projectId,
        platform: "node-express",
        team: team.slug,
      });

      if (!project.slug) {
        throw new Error("Project slug is required");
      }

      // Create a test client key
      clientKey = await ClientKey(testId, {
        name: `Test Key ${testId}`,
        project: project.slug,
        rateLimit: {
          window: 3600,
          count: 1000,
        },
      });

      expect(clientKey.id).toBeTruthy();
      expect(clientKey.name).toEqual(`Test Key ${testId}`);
      expect(clientKey.projectId).toBeTruthy();
      expect(clientKey.rateLimit?.window).toEqual(3600);
      expect(clientKey.rateLimit?.count).toEqual(1000);

      // Verify client key was created by querying the API directly
      const getResponse = await api.get(
        `/projects/${api.organizationId}/${project.slug}/keys/${clientKey.id}`,
      );
      expect(getResponse.status).toEqual(200);

      const responseData = await getResponse.json();
      expect(responseData.name).toEqual(`Test Key ${testId}`);

      // Update the client key
      clientKey = await ClientKey(testId, {
        name: `Updated Key ${testId}`,
        project: project.slug,
        rateLimit: {
          window: 7200,
          count: 2000,
        },
      });

      expect(clientKey.id).toEqual(clientKey.id);
      expect(clientKey.name).toEqual(`Updated Key ${testId}`);
      expect(clientKey.rateLimit?.window).toEqual(7200);
      expect(clientKey.rateLimit?.count).toEqual(2000);

      // Verify client key was updated
      const getUpdatedResponse = await api.get(
        `/projects/${api.organizationId}/${project.slug}/keys/${clientKey.id}`,
      );
      const updatedData = await getUpdatedResponse.json();
      expect(updatedData.name).toEqual(`Updated Key ${testId}`);
    } catch (err) {
      console.log(err);
      throw err;
    } finally {
      // Always clean up, even if test assertions fail
      await destroy(scope);

      // Verify client key was deleted
      const getDeletedResponse = await api.get(
        `/projects/${api.organizationId}/${project?.slug}/keys/${clientKey?.id}`,
      );
      expect(getDeletedResponse.status).toEqual(404);
    }
  });
});
