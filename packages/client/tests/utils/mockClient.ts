import { vi } from "vitest";
import { Client } from "../../src";

export function createMockClient() {
  const client = new Client();

  client.rest.get = vi.fn();
  client.rest.post = vi.fn();
  client.rest.patch = vi.fn();
  client.rest.put = vi.fn();
  client.rest.delete = vi.fn();

  return client;
}

export const MockData = {
  role: (id: string, name: string = "Test Role") => ({
    _id: id,
    name: name,
    permissions: { a: 1, d: 0 },
    hoist: false,
    rank: 1,
  }),
};
