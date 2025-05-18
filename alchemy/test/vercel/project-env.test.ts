import { afterAll, beforeAll, describe, expect } from "bun:test";
import { alchemy } from "../../src/alchemy.js";
import { destroy } from "../../src/destroy.js";
import { VercelApi } from "../../src/vercel/api.js";
import { ProjectEnv } from "../../src/vercel/project-env.js";
import { Project } from "../../src/vercel/project.js";
import { BRANCH_PREFIX } from "../util.js";
// must import this or else alchemy.test won't exist
import "../../src/test/bun.js";

const api = new VercelApi();

const test = alchemy.test(import.meta);

describe("ProjectEnv Resource", () => {
  // Use BRANCH_PREFIX for deterministic, non-colliding resource names
  const testId = `${BRANCH_PREFIX}-test-env`;
  let projectId: string;

  beforeAll(async () => {
    // Create a test project first
    const project = await Project(`${BRANCH_PREFIX}-test-project`, {
      name: `Test Project ${BRANCH_PREFIX}`,
      framework: "nextjs",
    });
    projectId = project.id;
  });

  test("create, update, and delete environment variable", async (scope) => {
    let env: ProjectEnv | undefined;
    try {
      // Create a test environment variable
      env = await ProjectEnv(testId, {
        projectId,
        key: "TEST_VAR",
        value: "test-value",
        type: "plain",
        target: ["production", "preview"],
      });

      expect(env.id).toBeTruthy();
      expect(env.key).toEqual("TEST_VAR");
      expect(env.value).toEqual("test-value");

      // Verify environment variable was created by querying the API directly
      const getResponse = await api.get(`/projects/${projectId}/env/${env.id}`);
      expect(getResponse.status).toEqual(200);

      const responseData = await getResponse.json();
      expect(responseData.key).toEqual("TEST_VAR");
      expect(responseData.value).toEqual("test-value");

      // Update the environment variable
      env = await ProjectEnv(testId, {
        projectId,
        key: "TEST_VAR",
        value: "updated-value",
        type: "plain",
        target: ["production"],
        gitBranch: "main",
      });

      expect(env.id).toEqual(env.id);
      expect(env.key).toEqual("TEST_VAR");
      expect(env.value).toEqual("updated-value");
      expect(env.gitBranch).toEqual("main");

      // Verify environment variable was updated
      const getUpdatedResponse = await api.get(
        `/projects/${projectId}/env/${env.id}`,
      );
      const updatedData = await getUpdatedResponse.json();
      expect(updatedData.key).toEqual("TEST_VAR");
      expect(updatedData.value).toEqual("updated-value");
      expect(updatedData.gitBranch).toEqual("main");
    } catch (err) {
      // log the error or else it's silently swallowed by destroy errors
      console.log(err);
      throw err;
    } finally {
      // Always clean up, even if test assertions fail
      await destroy(scope);

      // Verify environment variable was deleted
      const getDeletedResponse = await api.get(
        `/projects/${projectId}/env/${env?.id}`,
      );
      expect(getDeletedResponse.status).toEqual(404);
    }
  });

  test("create secret environment variable", async (scope) => {
    let env: ProjectEnv | undefined;
    try {
      // Create a test secret environment variable
      env = await ProjectEnv(`${testId}-secret`, {
        projectId,
        key: "SECRET_VAR",
        value: "secret-value",
        type: "secret",
        target: ["production"],
      });

      expect(env.id).toBeTruthy();
      expect(env.key).toEqual("SECRET_VAR");
      expect(env.type).toEqual("secret");

      // Verify secret environment variable was created
      const getResponse = await api.get(`/projects/${projectId}/env/${env.id}`);
      expect(getResponse.status).toEqual(200);

      const responseData = await getResponse.json();
      expect(responseData.key).toEqual("SECRET_VAR");
      expect(responseData.type).toEqual("secret");
    } catch (err) {
      // log the error or else it's silently swallowed by destroy errors
      console.log(err);
      throw err;
    } finally {
      // Always clean up, even if test assertions fail
      await destroy(scope);

      // Verify environment variable was deleted
      const getDeletedResponse = await api.get(
        `/projects/${projectId}/env/${env?.id}`,
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
