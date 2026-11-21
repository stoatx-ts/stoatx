import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMockClient, MockData } from "./utils/mockClient";
import { ulid } from "ulid";

describe("RoleManager", () => {
  let client: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    client = createMockClient();
    vi.clearAllMocks();
  });

  it("should fetch a role and add it to the cache", async () => {
    const roleId = ulid();
    const fakeApiResponse = MockData.role(roleId, "Admin");
    vi.mocked(client.rest.get).mockResolvedValueOnce(fakeApiResponse as any);

    const serverId = ulid();
    const server = client.servers._add({
      _id: serverId,
      owner: ulid(),
      name: "Test Server",
      channels: [],
      default_permissions: 0,
      approximate_member_count: 0,
    });

    const role = await server.roles.fetch(roleId);

    expect(client.rest.get).toHaveBeenCalledWith(`/servers/${serverId}/roles/${roleId}`);
    expect(client.rest.get).toHaveBeenCalledTimes(1);

    expect(role.name).toBe("Admin");
    expect(server.roles.cache.has(roleId)).toBe(true);
  });
});
