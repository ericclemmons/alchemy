import { describe, expect } from "bun:test";
import { alchemy } from "../../src/alchemy.js";
import { destroy } from "../../src/destroy.js";
import { UpstashApi, UpstashRedis } from "../../src/upstash/redis.js";
import { BRANCH_PREFIX } from "../util.js";
// must import this or else alchemy.test won't exist
import "../../src/test/bun.js";

const api = new UpstashApi();

const test = alchemy.test(import.meta);

describe("UpstashRedis Resource", () => {
  const testId = `${BRANCH_PREFIX}-test-redis`;

  test("create, update, and delete redis database", async (scope) => {
    let redis: UpstashRedis | undefined;
    try {
      // Create a test database
      redis = await UpstashRedis(testId, {
        name: `Test Redis ${testId}`,
        primaryRegion: "us-east-1",
      });

      expect(redis.id).toBeTruthy();
      expect(redis.name).toEqual(`Test Redis ${testId}`);
      expect(redis.primaryRegion).toEqual("us-east-1");

      // Verify database was created by querying the API directly
      const getResponse = await api.get(`/redis/database/${redis.id}`);
      expect(getResponse.status).toEqual(200);

      const responseData = await getResponse.json();
      expect(responseData.database_name).toEqual(`Test Redis ${testId}`);

      // Update the database
      redis = await UpstashRedis(testId, {
        name: `Updated Redis ${testId}`,
        primaryRegion: "us-east-1",
        readRegions: ["us-west-1"],
      });

      expect(redis.id).toEqual(redis.id);
      expect(redis.name).toEqual(`Updated Redis ${testId}`);
      expect(redis.readRegions).toEqual(["us-west-1"]);

      // Verify database was updated
      const getUpdatedResponse = await api.get(`/redis/database/${redis.id}`);
      const updatedData = await getUpdatedResponse.json();
      expect(updatedData.database_name).toEqual(`Updated Redis ${testId}`);
      expect(updatedData.read_regions).toEqual(["us-west-1"]);
    } catch (err) {
      console.log(err);
      throw err;
    } finally {
      // Always clean up, even if test assertions fail
      await destroy(scope);

      // Verify database was deleted
      const getDeletedResponse = await api.get(`/redis/database/${redis?.id}`);
      expect(getDeletedResponse.status).toEqual(404);
    }
  });
});
