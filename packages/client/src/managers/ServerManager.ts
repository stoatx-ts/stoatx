import { BaseManager } from "./BaseManager";
import { Server } from "../structures/Server";
import type { Client } from "../client/Client";
import { Server as RawServer, DataEditServer, FieldsServer } from "stoat-api";
import { finalizeEdit, setOrRemove } from "../utils/editPayload";

export interface ServerEditOptions {
  name?: string;
  description?: string | null;
  icon?: string | null;
  banner?: string | null;
  categories?: {
    id: string;
    title: string;
    channels: string[];
  }[];
  systemMessages?: {
    userJoined?: string | null;
    userLeft?: string | null;
    userKicked?: string | null;
    userBanned?: string | null;
  };
  analytics?: boolean;
  owner?: string;
}

export class ServerManager extends BaseManager<string, Server, RawServer> {
  constructor(client: Client, limit: number = Infinity) {
    super(client, limit);
  }

  /**
   * Tell BaseManager how to find the ID for Servers
   */
  protected extractId(data: RawServer): string {
    return data._id;
  }

  /**
   * Tell BaseManager how to build a Server
   */
  protected construct(data: RawServer): Server {
    return new Server(this.client, data);
  }

  /**
   * Fetches a server from the API.
   * @param id The server ID.
   * @param force Whether to skip the cache and fetch from the API.
   */
  public async fetch(id: string, force: boolean = false): Promise<Server> {
    if (!force) {
      const cached = this.cache.get(id);
      if (cached) return cached;
    }

    const data = (await this.client.rest.get(`/servers/${id}`)) as RawServer;
    return this._add(data);
  }

  public async edit(serverId: string, options: ServerEditOptions): Promise<Server> {
    const payload: DataEditServer = {};
    const remove: FieldsServer[] = [];

    if (options.name !== undefined) payload.name = options.name;
    setOrRemove(payload, remove, "description", options.description, "Description");
    setOrRemove(payload, remove, "icon", options.icon, "Icon");
    setOrRemove(payload, remove, "banner", options.banner, "Banner");

    // System Messages
    if (options.systemMessages) {
      payload.system_messages = {};
      const sm = options.systemMessages;

      if (sm.userJoined !== undefined) {
        payload.system_messages.user_joined = sm.userJoined;
      }

      if (sm.userLeft !== undefined) {
        payload.system_messages.user_left = sm.userLeft;
      }

      if (sm.userKicked !== undefined) {
        payload.system_messages.user_kicked = sm.userKicked;
      }

      if (sm.userBanned !== undefined) {
        payload.system_messages.user_banned = sm.userBanned;
      }
    } else if (options.systemMessages === null) {
      remove.push("SystemMessages");
    }

    if (options.categories !== undefined) payload.categories = options.categories;
    if (options.analytics !== undefined) payload.analytics = options.analytics;
    if (options.owner !== undefined) payload.owner = options.owner;

    finalizeEdit(payload, remove);

    const data = (await this.client.rest.patch(`/servers/${serverId}`, payload)) as RawServer;

    return this._add(data);
  }
}
