import { describe, expect } from "bun:test";
import { alchemy } from "../../src/alchemy.js";
import { destroy } from "../../src/destroy.js";
import { SentryApi } from "../../src/sentry/api.js";
import { Project } from "../../src/sentry/project.js";
import { Team } from "../../src/sentry/team.js";
import "../../src/test/bun.js";
import { BRANCH_PREFIX } from "../util.js";

const api = new SentryApi();

const test = alchemy.test(import.meta);

describe("Project Resource", () => {
  const testId = `${BRANCH_PREFIX}-test-project`;
  const teamId = `${BRANCH_PREFIX}-test-team`;

  test("create, update, and delete project", async (scope) => {
    let project: Project | undefined;
    let team: Team | undefined;

    try {
      // First create a team since project requires a team
      team = await Team(teamId, {
        name: `Test Team ${teamId}`,
        slug: teamId,
      });

      if (!team.slug) {
        throw new Error("Team slug is required");
      }

      // Create a test project
      project = await Project(testId, {
        name: `Test Project ${testId}`,
        slug: testId,
        platform: "node-express",
        team: team.slug,
      });

      expect(project.id).toBeTruthy();
      expect(project.name).toEqual(`Test Project ${testId}`);
      expect(project.slug).toEqual(testId);
      expect(project.platform).toEqual("node-express");
      expect(project.team.slug).toEqual(team.slug);

      // Verify project was created by querying the API directly
      const getResponse = await api.get(
        `/projects/${api.organizationId}/${project.slug}`,
      );
      expect(getResponse.status).toEqual(200);

      const responseData = await getResponse.json();
      expect(responseData.name).toEqual(`Test Project ${testId}`);

      // Update the project
      project = await Project(testId, {
        name: `Updated Project ${testId}`,
        slug: testId,
        platform: "node-express",
        team: team.slug,
      });

      expect(project.id).toEqual(project.id);
      expect(project.name).toEqual(`Updated Project ${testId}`);

      // Verify project was updated
      const getUpdatedResponse = await api.get(
        `/projects/${api.organizationId}/${project.slug}`,
      );
      const updatedData = await getUpdatedResponse.json();
      expect(updatedData.name).toEqual(`Updated Project ${testId}`);
    } catch (err) {
      console.log(err);
      throw err;
    } finally {
      // Always clean up, even if test assertions fail
      await destroy(scope);

      // Verify project was deleted
      const getDeletedResponse = await api.get(
        `/projects/${api.organizationId}/${project?.slug}`,
      );
      expect(getDeletedResponse.status).toEqual(404);
    }
  });
});
