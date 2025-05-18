import { describe, expect } from "bun:test";
import { alchemy } from "../../src/alchemy.js";
import { destroy } from "../../src/destroy.js";
import { VercelApi } from "../../src/vercel/api.js";
import { Project } from "../../src/vercel/project.js";
import { BRANCH_PREFIX } from "../util.js";
// must import this or else alchemy.test won't exist
import "../../src/test/bun.js";

const api = new VercelApi();

const test = alchemy.test(import.meta);

describe("Project Resource", () => {
  // Use BRANCH_PREFIX for deterministic, non-colliding resource names
  const testId = `${BRANCH_PREFIX}-test-project`;

  test("create, update, and delete project", async (scope) => {
    let project: Project | undefined;
    try {
      // Create a test project
      project = await Project(testId, {
        name: `Test Project ${testId}`,
        framework: "nextjs",
      });

      expect(project.id).toBeTruthy();
      expect(project.name).toEqual(`Test Project ${testId}`);

      // Verify project was created by querying the API directly
      const getResponse = await api.get(`/projects/${project.id}`);
      expect(getResponse.status).toEqual(200);

      const responseData = await getResponse.json();
      expect(responseData.name).toEqual(`Test Project ${testId}`);

      // Update the project
      project = await Project(testId, {
        name: `Updated Project ${testId}`,
        framework: "nextjs",
        buildCommand: "next build",
      });

      expect(project.id).toEqual(project.id);
      expect(project.name).toEqual(`Updated Project ${testId}`);
      expect(project.buildCommand).toEqual("next build");

      // Verify project was updated
      const getUpdatedResponse = await api.get(`/projects/${project.id}`);
      const updatedData = await getUpdatedResponse.json();
      expect(updatedData.name).toEqual(`Updated Project ${testId}`);
      expect(updatedData.buildCommand).toEqual("next build");
    } catch (err) {
      // log the error or else it's silently swallowed by destroy errors
      console.log(err);
      throw err;
    } finally {
      // Always clean up, even if test assertions fail
      await destroy(scope);

      // Verify project was deleted
      const getDeletedResponse = await api.get(`/projects/${project?.id}`);
      expect(getDeletedResponse.status).toEqual(404);
    }
  });
});
