import { describe, expect } from "bun:test";
import { alchemy } from "../../src/alchemy.js";
import { destroy } from "../../src/destroy.js";
import { createNeonApi } from "../../src/neon/api.js";
import {
  type NeonBranch,
  type NeonDatabase,
  type NeonEndpoint,
  NeonProject,
  type NeonRole,
} from "../../src/neon/project.js";
import { BRANCH_PREFIX } from "../util.js";
// must import this or else alchemy.test won't exist
import "../../src/test/bun.js";

// Create API client for verification
const api = createNeonApi();

const test = alchemy.test(import.meta);

describe("NeonProject Resource", () => {
  // Use BRANCH_PREFIX for deterministic, non-colliding resource names
  const testId = `${BRANCH_PREFIX}-test-neon-project`;

  // Helper function to generate a unique project name
  const generateProjectName = () => `Test Project ${testId}-${Date.now()}`;

  test("create, update, and delete neon project", async (scope) => {
    let project: NeonProject | undefined;
    try {
      // Create a test Neon project with basic settings
      const projectName = generateProjectName();
      project = await NeonProject(testId, {
        name: projectName,
        region_id: "aws-us-east-1",
        pg_version: 15,
      });

      expect(project.id).toBeTruthy();
      expect(project.name).toEqual(projectName);
      expect(project.region_id).toEqual("aws-us-east-1");
      expect(project.pg_version).toEqual(15);
      expect(project.created_at).toBeTruthy();
      expect(project.updated_at).toBeTruthy();

      // Verify the additional properties are included
      expect(project.branch).toBeTruthy();
      const branch: NeonBranch = project.branch!;
      expect(branch.name).toBeTruthy();
      expect(branch.id).toBeTruthy();
      expect(branch.project_id).toEqual(project.id);
      expect(branch.current_state).toBeTruthy();

      expect(project.endpoints).toBeTruthy();
      const endpoint: NeonEndpoint = project.endpoints![0];
      expect(endpoint.type).toEqual("read_write");
      expect(endpoint.host).toBeTruthy();
      expect(endpoint.branch_id).toBeTruthy();
      expect(endpoint.project_id).toEqual(project.id);

      expect(project.connection_uris).toBeTruthy();
      expect(
        project.connection_uris![0].connection_uri.unencrypted,
      ).toBeTruthy();
      expect(project.connection_uris![0].connection_uri.unencrypted).toContain(
        "postgresql://",
      );

      expect(project.databases).toBeTruthy();
      const database: NeonDatabase = project.databases![0];
      expect(database.name).toBeTruthy();
      expect(database.id).toBeTruthy();
      expect(database.branch_id).toBeTruthy();
      expect(database.owner_name).toBeTruthy();

      expect(project.roles).toBeTruthy();
      const role: NeonRole = project.roles![0];
      expect(role.name).toBeTruthy();
      expect(role.branch_id).toBeTruthy();

      // Verify operations are not exposed in the project output
      expect((project as any).operations).toBeUndefined();

      // Verify project was created by querying the API directly
      const getResponse = await api.get(`/projects/${project.id}`);
      expect(getResponse.status).toEqual(200);

      const responseData = await getResponse.json();
      expect(responseData.project.name).toEqual(projectName);

      // Check if the branch is in ready state, confirming operations were waited for
      expect(project.branch!.current_state).toEqual("ready");

      // Check if endpoints are active, confirming operations were waited for
      expect(project.endpoints![0].current_state).toEqual("active");

      // Update the project name
      const updatedName = `${generateProjectName()}-updated`;
      project = await NeonProject(testId, {
        name: updatedName,
        region_id: "aws-us-east-1",
        pg_version: 15,
        existing_project_id: project.id,
      });

      expect(project.id).toBeTruthy();
      expect(project.name).toEqual(updatedName);

      // Verify project was updated
      const getUpdatedResponse = await api.get(`/projects/${project.id}`);
      const updatedData = await getUpdatedResponse.json();
      expect(updatedData.project.name).toEqual(updatedName);
    } catch (err) {
      // log the error or else it's silently swallowed by destroy errors
      console.log(err);
      throw err;
    } finally {
      // Always clean up, even if test assertions fail
      await destroy(scope);

      // Verify project was deleted
      if (project?.id) {
        const getDeletedResponse = await api.get(`/projects/${project.id}`);
        expect(getDeletedResponse.status).toEqual(404);
      }
    }
  });
});
