import { Role } from "../structures/Role";
import type { Server } from "../structures/Server";
import type { Client } from "../client/Client";
import type { PermissionResolvable } from "../utils/permissions";
import { BaseManager } from "./BaseManager";
import { AttachmentBuilder } from "../builders/AttachmentBuilder";
import { buildPermissionPayload, finalizeEdit, setOrRemove, setOrRemoveAttachment } from "../utils/editPayload";
import {
  Role as RawRole,
  DataCreateRole,
  DataEditRole,
  FieldsRole,
  DataSetServerRolePermission,
  DataEditRoleRanks,
} from "stoat-api";

export interface RoleCreateOptions {
  name: string;
}

export interface RoleEditOptions {
  // Role name
  name?: string;
  // Role color
  color?: string | null;
  // Whether this role should be displayed separately
  hoist?: boolean;
  // Provide an Autumn attachment ID
  icon?: string | AttachmentBuilder | null;
}

export interface RolePermissionOptions {
  allow?: PermissionResolvable;
  deny?: PermissionResolvable;
}

export type RoleResolvable = Role | string;

const ROLE_MENTION = /[<%>]/g;

export class RoleManager extends BaseManager<string, Role, RawRole> {
  /**
   * Manages API methods and caching for server roles.
   */
  constructor(
    client: Client,
    public server: Server,
    limit: number = Infinity,
  ) {
    super(client, limit);
  }

  /**
   * Tell BaseManager how to find the ID for Roles
   */
  protected extractId(data: RawRole): string {
    return data._id;
  }

  /**
   * Tell BaseManager how to build a Role
   */
  protected construct(data: RawRole): Role {
    return new Role(this.client, data, this.server.id);
  }

  /**
   * Adds or updates a role in the local cache.
   * @internal
   * @param data The raw role data from the API.
   * @param idParam An optional ID parameter if the payload wraps the role object.
   * @returns The newly created or updated Role object.
   */
  public override _add(data: RawRole, idParam?: string): Role {
    const id = idParam ?? data._id;
    const existing = this.cache.get(id);

    if (existing) {
      existing._patch(data);
      return existing;
    }

    const role = new Role(this.client, data, this.server.id);
    this.cache.set(role.id, role);
    return role;
  }

  /**
   * Resolves a RoleResolvable to a Role object from the cache.
   * @param role The RoleResolvable to resolve.
   * @returns The resolved Role object, or undefined if not found.
   */
  public resolve(role: RoleResolvable): Role | undefined {
    return this.resolveFromCache(role, Role, ROLE_MENTION);
  }

  /**
   * Extracts ID from a RoleResolvable.
   * @param role The RoleResolvable to extract the ID from.
   * @returns The extracted role ID.
   * @throws TypeError if an invalid type is provided.
   */
  public resolveId(role: RoleResolvable): string {
    return this.resolveIdFrom(role, Role, ROLE_MENTION);
  }

  /**
   * Creates a new role in this server.
   * @param options The name and optional rank of the new role
   * @returns Role The role that was created
   * @throws {Error} If the role cannot be created (e.g., lack of permissions, invalid options).
   * @throws {TypeError} If invalid options are provided.
   * @example
   * // Create a new role named "Moderator" with rank 1
   * const moderatorRole = await server.roles.create({ name: "Moderator", rank: 1 });
   * console.log(`Created role: ${moderatorRole.name} with ID: ${moderatorRole.id}`);
   */
  public async create(options: RoleCreateOptions): Promise<Role> {
    if (!options || typeof options !== "object") {
      throw new TypeError("RoleCreateOptions must be a valid object.");
    }

    if (typeof options.name !== "string" || options.name.trim().length === 0) {
      throw new TypeError("A valid role 'name' (string) must be provided.");
    }

    const payload: DataCreateRole = {
      name: options.name,
    };

    const data = await this.client.rest.post(`/servers/${this.server.id}/roles`, payload);

    return this._add(data.role);
  }

  /**
   * Fetches a Role from the API or resolves it from the local cache.
   * @param role The ID, mention, or Role object to fetch.
   * @param force Whether to skip the cache check and force a direct API request. Defaults to false.
   * @returns A promise that resolves to the fetched Role object.
   * @throws {TypeError} If an invalid RoleResolvable is provided.
   * @throws {Error} If the API request fails (e.g., the role does not exist).
   * @example
   * // Fetch a role from the API
   * const role = await server.roles.fetch("01JE2MM759J5D7CHJF084R7MJ2");
   * console.log(`Fetched role: ${role.name} with ID: ${role.id}`);
   *
   * // Fetch a role by mention
   * const role = await.server.roles.fetch("<%01JE2MM759J5D7CHJF084R7MJ2>");
   * console.log(`Fetched role: ${role.name} with ID: ${role.id}`);
   *
   * // Force fetch a role, bypassing the cache
   * const role = await server.roles.fetch("01JE2MM759J5D7CHJF084R7MJ2", true);
   * console.log(`Fetched role: ${role.name} with ID: ${role.id}`);
   */
  public async fetch(role: RoleResolvable, force: boolean = false): Promise<Role> {
    return this.fetchWithCache(role, force, (id) => this.client.rest.get(`/servers/${this.server.id}/roles/${id}`));
  }

  /**
   * Edits an existing role in the server.
   * @param role The {@link RoleResolvable} to edit.
   * @param options The fields to update.
   * @returns A promise that resolves to the updated Role.
   * @throws {TypeError} If invalid options or RoleResolvable are provided.
   * @throws {Error} If the API request fails (e.g., lack of permissions).
   * @example
   * // Rename a role and give it a red color
   * await server.roles.edit("01H...", { name: "Super Admin", colour: "#FF0000" });
   *
   * // Remove the custom color from a role
   * await server.roles.edit(role, { colour: null });
   */
  public async edit(role: RoleResolvable, options: RoleEditOptions): Promise<Role> {
    if (!options || typeof options !== "object") {
      throw new TypeError("RoleEditOptions must be a valid object.");
    }

    const id = this.resolveId(role);
    const payload: DataEditRole = {};
    const remove: FieldsRole[] = [];

    if (options.name !== undefined) payload.name = options.name;
    if (options.hoist !== undefined) payload.hoist = options.hoist;

    setOrRemove(payload, remove, "colour", options.color, "Colour");
    await setOrRemoveAttachment(this.client.rest, payload, remove, "icon", options.icon, "Icon", "icons");

    if (!finalizeEdit(payload, remove)) {
      return this.fetch(id);
    }
    const endpoint = `/servers/${this.server.id}/roles/${id}` as const;

    const data = await this.client.rest.patch(endpoint, payload);

    // TypeScript can't differ /roles/ranks and /roles/:id so we have to cast it
    return this._add(data as RawRole, id);
  }

  /**
   * Deletes a Role from the server.
   * @param role The RoleResolvable to delete
   * @returns A promise that resolves when the role is successfully deleted.
   * @throws {TypeError} If an invalid RoleResolvable is provided.
   * @throws {Error} If the role cannot be deleted (e.g., lack of permissions).
   * @example
   * // Delete a role by its ID
   * await server.roles.delete("01JE2MM759J5D7CHJF084R7MJ2");
   * console.log("Role deleted successfully.");
   *
   * // Delete a role using a Role object
   * const role = await server.roles.fetch("01JE2MM759J5D7CHJF084R7");
   * await server.roles.delete(role);
   * console.log("Role deleted successfully.");
   *
   * // Delete a role by mention
   * await server.roles.delete("<%01JE2MM759J5D7CHJF084R7MJ2>");
   * console.log("Role deleted successfully.");
   */
  public async delete(role: RoleResolvable): Promise<void> {
    const id = this.resolveId(role);

    await this.client.rest.delete(`/servers/${this.server.id}/roles/${id}`);

    this.cache.delete(id);
  }

  /**
   * Updates the permissions for a role in the server.
   * @param role The RoleResolvable to update permissions for.
   * @param options The allow and deny permissions to set.
   * @returns A promise that resolves to the updated Role.
   * @throws {TypeError} If an invalid RoleResolvable or options are provided.
   * @throws {Error} If the API request fails.
   * @example
   * // Set permissions using an array of strings.
   * await server.roles.setPermissions(role, {
   *   allow: ["ManageChannel", "ViewChannel", "SendMessage"]
   * });
   */
  public async setPermissions(role: RoleResolvable, options: RolePermissionOptions): Promise<Role> {
    if (!options || typeof options !== "object") {
      throw new TypeError("RolePermissionOptions must be a valid object.");
    }

    const id = this.resolveId(role);

    const payload: DataSetServerRolePermission = {
      permissions: buildPermissionPayload(options),
    };

    const data = await this.client.rest.put(`/servers/${this.server.id}/permissions/${id}`, payload);

    // The fucking API returns a Server object
    this.server._patch(data);

    // So we turn it into a role to improve DX
    return this.cache.get(id) as Role;
  }

  /**
   * Updates the hierarchical positions of roles in the server.
   * @param ranks An array of RoleResolvables representing the new order of roles.
   * @returns A promise that resolves when the ranks are successfully updated.
   * @throws {TypeError} If the ranks parameter is not an array or contains invalid resolvables.
   * @throws {Error} If the API request fails.
   * @example
   * // Reorder roles by passing an array of Role objects or IDs
   * await server.roles.setRanks(["RoleID_1", adminRoleObject, "RoleID_3"]);
   */
  public async setRanks(ranks: RoleResolvable[]): Promise<Server> {
    if (!Array.isArray(ranks)) {
      throw new TypeError("The 'ranks' parameter must be an array of RoleResolvables.");
    }

    const mappedIds = ranks.map((role) => this.resolveId(role));

    const payload: DataEditRoleRanks = {
      ranks: mappedIds,
    };

    const data = await this.client.rest.patch(`/servers/${this.server.id}/roles/ranks`, payload);

    this.server._patch(data);

    return this.server;
  }
}
