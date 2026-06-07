import { describe, it, expect, beforeEach, vi } from "vitest";
import { createMockClient, MockData } from "./utils/mockClient";

describe("RoleManager", () => {
  let client: ReturnType<typeof createMockClient>;

  beforeEach(() => {
    client = createMockClient();
    vi.clearAllMocks();
  });

  it("should fetch a role and add it to the cache", async () => {
    const fakeApiResponse = MockData.role("role_123", "Admin");
    vi.mocked(client.rest.get).mockResolvedValueOnce(fakeApiResponse as any);

    const server = client.servers._add({ _id: "server_123", name: "Test Server" });

    const role = await server.roles.fetch("role_123");

    expect(client.rest.get).toHaveBeenCalledWith("/servers/server_123/roles/role_123");
    expect(client.rest.get).toHaveBeenCalledTimes(1);

    expect(role.name).toBe("Admin");
    expect(server.roles.cache.has("role_123")).toBe(true);
  });
});
