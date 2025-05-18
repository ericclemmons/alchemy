import { afterAll, beforeAll, describe, expect } from "bun:test";
import { alchemy } from "../../src/alchemy.js";
import { destroy } from "../../src/destroy.js";
import { VercelApi } from "../../src/vercel/api.js";
import { ProjectDomain } from "../../src/vercel/project-domain.js";
import { Project } from "../../src/vercel/project.js";
import { BRANCH_PREFIX } from "../util.js";
// must import this or else alchemy.test won't exist
import "../../src/test/bun.js";

const api = new VercelApi();

const test = alchemy.test(import.meta);

describe("ProjectDomain Resource", () => {
  // Use BRANCH_PREFIX for deterministic, non-colliding resource names
  const testId = `${BRANCH_PREFIX}-test-domain`;
  let projectId: string;

  beforeAll(async () => {
    // Create a test project first
    const project = await Project(`${BRANCH_PREFIX}-test-project`, {
      name: `Test Project ${BRANCH_PREFIX}`,
      framework: "nextjs",
    });
    projectId = project.id;
  });

  test("create, update, and delete domain", async (scope) => {
    let domain: ProjectDomain | undefined;
    try {
      // Create a test domain
      domain = await ProjectDomain(testId, {
        name: `test-${testId}.vercel.app`,
        projectId,
      });

      expect(domain.id).toBeTruthy();
      expect(domain.name).toEqual(`test-${testId}.vercel.app`);

      // Verify domain was created by querying the API directly
      const getResponse = await api.get(
        `/projects/${projectId}/domains/${domain.name}`,
      );
      expect(getResponse.status).toEqual(200);

      const responseData = await getResponse.json();
      expect(responseData.name).toEqual(`test-${testId}.vercel.app`);

      // Update the domain
      domain = await ProjectDomain(testId, {
        name: `test-${testId}.vercel.app`,
        projectId,
        gitBranch: "main",
      });

      expect(domain.id).toEqual(domain.id);
      expect(domain.name).toEqual(`test-${testId}.vercel.app`);
      expect(domain.gitBranch).toEqual("main");

      // Verify domain was updated
      const getUpdatedResponse = await api.get(
        `/projects/${projectId}/domains/${domain.name}`,
      );
      const updatedData = await getUpdatedResponse.json();
      expect(updatedData.name).toEqual(`test-${testId}.vercel.app`);
      expect(updatedData.gitBranch).toEqual("main");
    } catch (err) {
      // log the error or else it's silently swallowed by destroy errors
      console.log(err);
      throw err;
    } finally {
      // Always clean up, even if test assertions fail
      await destroy(scope);

      // Verify domain was deleted
      const getDeletedResponse = await api.get(
        `/projects/${projectId}/domains/${domain?.name}`,
      );
      expect(getDeletedResponse.status).toEqual(404);
    }
  });

  afterAll(async () => {
    // Clean up the test project
    await Project(`${BRANCH_PREFIX}-test-project`, {
      name: `Test Project ${BRANCH_PREFIX}`,
      framework: "nextjs",
    });
  });
});
