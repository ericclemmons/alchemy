import { describe, expect } from "bun:test";
import { alchemy } from "../../src/alchemy.js";
import { destroy } from "../../src/destroy.js";
import { SentryApi } from "../../src/sentry/api.js";
import { Team } from "../../src/sentry/team.js";
import "../../src/test/bun.js";
import { BRANCH_PREFIX } from "../util.js";

const api = new SentryApi();

const test = alchemy.test(import.meta);

describe("Team Resource", () => {
  const testId = `${BRANCH_PREFIX}-test-team`;

  test("create, update, and delete team", async (scope) => {
    let team: Team | undefined;
    try {
      // Create a test team
      team = await Team(testId, {
        name: `Test Team ${testId}`,
        slug: testId,
      });

      expect(team.id).toBeTruthy();
      expect(team.name).toEqual(`Test Team ${testId}`);
      expect(team.slug).toEqual(testId);

      // Verify team was created by querying the API directly
      const getResponse = await api.get(
        `/teams/${api.organizationId}/${team.slug}`,
      );
      expect(getResponse.status).toEqual(200);

      const responseData = await getResponse.json();
      expect(responseData.name).toEqual(`Test Team ${testId}`);

      // Update the team
      team = await Team(testId, {
        name: `Updated Team ${testId}`,
        slug: testId,
      });

      expect(team.id).toEqual(team.id);
      expect(team.name).toEqual(`Updated Team ${testId}`);

      // Verify team was updated
      const getUpdatedResponse = await api.get(
        `/teams/${api.organizationId}/${team.slug}`,
      );
      const updatedData = await getUpdatedResponse.json();
      expect(updatedData.name).toEqual(`Updated Team ${testId}`);
    } catch (err) {
      console.log(err);
      throw err;
    } finally {
      // Always clean up, even if test assertions fail
      await destroy(scope);

      // Verify team was deleted
      const getDeletedResponse = await api.get(
        `/teams/${api.organizationId}/${team?.slug}`,
      );
      expect(getDeletedResponse.status).toEqual(404);
    }
  });
});
