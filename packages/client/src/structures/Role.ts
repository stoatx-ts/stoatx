import { Base } from "./Base";
import type { Client } from "../client/Client";
import type { Server } from "./Server";
import * as util from "node:util";
import { Permissions } from "../utils/permissions";
import type { RoleEditOptions, RolePermissionOptions } from "../managers/RoleManager";
import { Attachment } from "./Attachment";
import { AttachmentBuilder } from "../builders/AttachmentBuilder";
import {Role as RawRole} from "stoat-api";

export class Role extends Base {
  public serverId: string;
  public name!: string;
  public color: string | null | undefined = null;
  public hoist: boolean = false;
  public rank: number = 0;
  public icon: Attachment | null = null;
  private _permissions: bigint = 0n;

  constructor(client: Client, data: RawRole, serverId: string) {
    super(client, data);
    this.serverId = serverId;
    this._patch(data);
  }

  /**
   * Updates the role instance with new data without losing the object reference.
   * @internal
   */
  public _patch(data: RawRole) {
    if (data.name !== undefined) this.name = data.name;
    if (data.colour !== undefined) this.color = data.colour;
    if (data.hoist !== undefined) this.hoist = data.hoist;
    if (data.rank !== undefined) this.rank = data.rank;
    if (data.icon !== undefined) this.icon = data.icon !== null ? new Attachment(this.client, data.icon): null;
    if (data.permissions !== undefined) {
      try {
        if (typeof data.permissions === "object" && data.permissions !== null) {
          const allowPerms = data.permissions.a ?? 0;
          this._permissions = BigInt(allowPerms);
        } else {
          this._permissions = BigInt(data.permissions);
        }
      } catch {
        this._permissions = 0n;
      }
    }
  }

  /**
   * The server this role belongs to.
   * Pulls dynamically from the cache to prevent massive memory duplication.
   */
  public get server(): Server | undefined {
    return this.client.servers.cache.get(this.serverId);
  }

  /**
   * Permissions for this role
   */
  public get permissions(): Permissions {
    return new Permissions(this._permissions);
  }

  /**
   * Fetches this role directly from the API to ensure data is up to date.
   * @param force Whether to skip the cache check and force a direct API request. Defaults to false.
   * @returns A promise that resolves to the fetched Role object.
   * @throws {TypeError} If an invalid RoleResolvable is provided.
   * @throws {Error} If the API request fails (e.g., the role does not exist).
   * @example
   * // Refresh the role's data from the API
   * await role.fetch();
   * console.log(`Role updated, current name: ${role.name}`);
   */
  public async fetch(force: boolean = true): Promise<Role> {
    let server = this.server;

    if (!server) {
      server = await this.client.servers.fetch(this.serverId);
    }

    return (await server.roles.fetch(this.id, force)) as this;
  }

  /**
   * Edits the role with the given options. Only the fields provided in the options will be updated; all other fields will remain unchanged.
   * @param options The fields to update.
   * @returns A promise that resolves to the updated Role.
   * @throws {TypeError} If invalid options or RoleResolvable are provided.
   * @throws {Error} If the API request fails (e.g., lack of permissions).
   * @example
   * // Change the role's name and color
   * await role.edit({ name: "Senior Admin", color: "#FFD700" });
   *
   * // Remove the custom color from the role
   * await role.edit({ color: null });
   */
  public async edit(options: RoleEditOptions): Promise<Role> {
    let server = this.server;
    if (!server) server = await this.client.servers.fetch(this.serverId);

    return (await server.roles.edit(this.id, options)) as this;
  }

  /**
   * Deletes this Role from the server.
   * @throws {Error} If the role cannot be deleted (e.g., lack of permissions).
   * @example
   * // Delete a role by its ID
   * await role.delete();
   */
  public async delete(): Promise<void> {
    let server = this.server;

    if (!server) {
      server = await this.client.servers.fetch(this.serverId);
    }

    await server.roles.delete(this.id);
  }

  /**
   * Updates the permissions for this role.
   * @param options The allow and deny permissions to set.
   * @returns A promise that resolves to the updated Role object.
   * @throws {TypeError} If invalid options are provided.
   * @throws {Error} If the API request fails.
   * @example
   * // Grant the role permission to manage channels and send messages
   * await role.setPermissions({
   *   allow: ["ManageChannel", "SendMessage"]
   * });
   */
  public async setPermissions(options: RolePermissionOptions): Promise<Role> {
    let server = this.server;
    if (!server) server = await this.client.servers.fetch(this.serverId);

    return (await server.roles.setPermissions(this.id, options)) as this;
  }

  /**
   * Updates the hierarchical position of this role.
   * Automatically reconstructs the role array and performs a bulk update.
   * @param newPosition The new rank/position for this role (0-indexed).
   * @returns A promise that resolves to this updated Role object.
   * @throws {Error} If API request fails.
   * @example
   * // Move this role to position 2 in the hierarchy
   * await role.setPosition(2);
   * console.log(`Role moved to rank: ${role.rank}`);
   */
  public async setPosition(newPosition: number): Promise<Role> {
    let server = this.server;
    if (!server) server = await this.client.servers.fetch(this.serverId);

    const sortedRoles = Array.from(server.roles.cache.values()).sort((a, b) => a.rank - b.rank);

    const filteredRoles = sortedRoles.filter((r) => r.id !== this.id);

    const clampedPosition = Math.max(0, Math.min(newPosition, filteredRoles.length));

    filteredRoles.splice(clampedPosition, 0, this);

    await server.roles.setRanks(filteredRoles);

    return this;
  }

  /**
   * Change the name for this role
   * @param name The new name for the role
   * @returns A promise that resolves to this updated Role object.
   * @throws {Error} If API request fails.
   * @example
   * // Change the role's name
   * await role.setName("New Role Name");
   * console.log(`Role's new name: ${role.name}`);
   */
  public async setName(name: string): Promise<Role> {
    return await this.edit({ name });
  }

  /**
   * Change the color for this role, it can be a HEX or CSS colours
   * @param {[string]} color The new color for the role
   * @returns A promise that resolves to this updated Role object.
   * @throws {Error} If API request fails
   * @example
   * // Change the role's color
   * await role.setColour("#FF0000");
   * console.log(`Role's new color: ${role.color}`);
   *
   * // Use CSS color linear-graident
   * await role.setColour("linear-gradient(90deg, #FF0000, #0000FF)");
   * console.log(`Role's new color: ${role.color}`);
   *
   * // Remove the custom color from the role
   * await role.setColour(null);
   * console.log(`Role's color removed, current color: ${role.color}`);
   */
  public async setColor(color: string | null): Promise<Role> {
    return await this.edit({ color });
  }

  /**
   * Edit the icon of this role
   * @param icon Autumn ID for the new icon, or null to remove the custom icon
   * @returns A promise that resolves to this updated Role object.
   * @throws {Error} If API request fails
   * @example
   * // Set a new icon for the role
   * await role.setIcon("AUTUMN_ID_FOR_ICON");
   * console.log(`Role's new icon: ${role.icon}`);
   *
   * // Use AttachmentBuilder to upload a new icon file
   * import { readFile } from "node:fs/promises";
   * const iconFile = await readFile("./a.jpg");
   * const attachment = new AttachmentBuilder(iconFile, "a.jpg");
   * await role.setIcon(attachment);
   * console.log(`Role's new icon: ${role.icon}`);
   */
  public async setIcon(icon: string | AttachmentBuilder | null): Promise<Role> {
    return await this.edit({ icon });
  }

  /**
   * Change the hoist status for this role
   * @param hoist The new hoist status for the role
   * @returns A promise that resolves to this updated Role object.
   * @throws {Error} If API request fails
   * @example
   * // Enable hoisting for the role
   * await role.setHoist(true);
   * console.log(`Role is now hoisted: ${role.hoist}`);
   */
  public async setHoist(hoist: boolean): Promise<Role> {
    return await this.edit({ hoist });
  }

  /**
   * Customizer for Node.js `console.log` and `util.inspect`.
   * Hides the cyclic client reference and raw serverId for a cleaner output.
   * @internal
   */
  [util.inspect.custom]() {
    const { client, serverId, ...props } = this;
    return `${this.constructor.name} ${util.inspect(props)}`;
  }
}
