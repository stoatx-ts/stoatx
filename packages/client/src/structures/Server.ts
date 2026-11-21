import { Base } from "./Base";
import type { Client } from "../client/Client";
import { FetchMembersOptions, MemberManager } from "../managers/MemberManager";
import { ServerChannelManager } from "../managers/ServerChannelManager";
import { Attachment } from "./Attachment";
import { RoleManager } from "../managers/RoleManager";
import { ServerInviteManager } from "../managers/ServerInviteManager";
import { ServerBanManager } from "../managers/ServerBanManager";
import { ServerEditOptions } from "../managers/ServerManager";
import { EmojiManager } from "../managers/EmojiManager";
import type { Server as RawServer, Category as RawCategory, FieldsServer } from "stoat-api";
import { decodeTime } from "ulid";
import { RouteParams } from "../utils/schema";
import { Collection } from "../utils/Collection";
import { AuditLogEntry } from "./AuditLogEntry";
import { sendReport, type ContentReportReason, type ReportOptions } from "../utils/report";
import { toDiscoverRequest, type DiscoverRequest } from "../utils/discover";
import { Permissions, type PermissionResolvable } from "../utils/permissions";

export interface FetchAuditLogsOptions {
  /* Filter by who ran the action */
  user?: string;
  /* Filter by who the action is targetting */
  target?: string;
  /* Filter by the action type */
  type?: string[];
  /* Entries before a certain entry id */
  before?: string;
  /* Entries after a certain entry id */
  after?: string;
  /* Maximum numbers of entries to fetch */
  limit?: number;
}

export class Server extends Base {
  public channelIds: string[] = [];
  public defaultPermissions!: bigint;
  public name!: string;
  public ownerId!: string;
  public analytics: boolean = false;
  public banner: Attachment | null = null;
  public categories: RawCategory[] | null = null;
  public description: string | null = null;
  public discoverable: boolean = false;
  public flags: number = 0;
  public icon: Attachment | null = null;
  public nsfw: boolean = false;
  public members: MemberManager;
  public channels: ServerChannelManager;
  public roles: RoleManager;
  public bans: ServerBanManager;
  public invites: ServerInviteManager;
  public emojis: EmojiManager;
  public createdAt!: Date;
  public createdTimestamp!: number;
  public approximateMemberCount?: number;

  constructor(client: Client, data: RawServer) {
    super(client, data);
    this.channels = new ServerChannelManager(client, this);
    this.members = new MemberManager(client, this);
    this.roles = new RoleManager(client, this);
    this.bans = new ServerBanManager(this.client, this);
    this.invites = new ServerInviteManager(this.client, this);
    this.emojis = new EmojiManager(this.client, this);

    const timestamp = decodeTime(data._id);
    this.createdAt = new Date(timestamp);
    this.createdTimestamp = timestamp;

    this._patch(data);
  }

  /**
   * Updates the server instance with new data without losing the object reference.
   */
  public _patch(data: RawServer, clear?: FieldsServer[]) {
    if (data.channels !== undefined) this.channelIds = data.channels;
    if (data.default_permissions !== undefined) {
      try {
        this.defaultPermissions = BigInt(data.default_permissions);
      } catch {
        this.defaultPermissions = 0n;
      }
    }
    if (data.name !== undefined) this.name = data.name;
    if (data.owner !== undefined) this.ownerId = data.owner;
    if (data.analytics !== undefined) this.analytics = data.analytics;
    if (data.categories !== undefined) this.categories = data.categories;
    if (data.description !== undefined) this.description = data.description;
    if (data.discoverable !== undefined) this.discoverable = data.discoverable;
    if (data.flags !== undefined) this.flags = data.flags;
    if (data.nsfw !== undefined) this.nsfw = data.nsfw;
    if (data.icon !== undefined) {
      this.icon = data.icon ? new Attachment(this.client, data.icon) : null;
    }
    if (data.banner !== undefined) {
      this.banner = data.banner ? new Attachment(this.client, data.banner) : null;
    }
    if (data.roles !== undefined) {
      for (const [id, roleData] of Object.entries(data.roles)) {
        this.roles._add({ id, ...(roleData as any) });
      }
    }
    if (data.approximate_member_count !== undefined) {
      this.approximateMemberCount = data.approximate_member_count;
    }

    if (clear && Array.isArray(clear)) {
      for (const field of clear) {
        switch (field) {
          case "Description":
            this.description = null;
            break;
          case "Icon":
            this.icon = null;
            break;
          case "Banner":
            this.banner = null;
            break;
          case "Categories":
            this.categories = null;
            break;
        }
      }
    }
  }

  /**
   * Edits this server.
   * @param options The fields to update.
   */
  public async edit(options: ServerEditOptions): Promise<this> {
    await this.client.servers.edit(this.id, options);
    return this;
  }

  /**
   * Whether any channel in this server has messages the logged-in user hasn't read. Always `false` for bots.
   */
  public get unread(): boolean {
    return this.channelIds.some((id) => this.client.unreads.isUnread(id));
  }

  /**
   * How many unread messages across this server's channels mention the logged-in user. Always `0` for bots.
   */
  public get mentionCount(): number {
    return this.channelIds.reduce((total, id) => total + this.client.unreads.mentionCount(id), 0);
  }

  /**
   * Marks every channel in this server as read (user sessions only).
   */
  public async ack(): Promise<void> {
    return this.client.unreads.ackServer(this);
  }

  /**
   * Asks the gateway for presence and member updates from this server (user sessions only; the
   * server ignores it for bots, which receive these updates anyway).
   *
   * A subscription lasts 15 minutes, so call this again while the server stays on screen.
   * Each connection keeps at most 5 subscriptions; subscribing to a 6th drops the least recently used.
   * @returns `false` if the gateway isn't connected.
   */
  public subscribe(): boolean {
    return this.client.gateway.send({ type: "Subscribe", server_id: this.id });
  }

  /**
   * Sets the permissions everyone in the server has by default (the `@everyone` role).
   * @param permissions The permissions to allow.
   * @returns This server, updated.
   * @example
   * await server.setDefaultPermissions(["ViewChannel", "ReadMessageHistory", "SendMessage"]);
   */
  public async setDefaultPermissions(permissions: PermissionResolvable): Promise<this> {
    const data = await this.client.rest.put(`/servers/${this.id}/permissions/default`, {
      permissions: Number(Permissions.resolve(permissions)),
    });
    this._patch(data);
    return this;
  }

  /**
   * Asks to list this server on Discover. Only does something on instances that run Discover;
   * elsewhere the request is stored but never reviewed.
   */
  public async requestDiscover(): Promise<void> {
    await this.client.rest.put(`/servers/${this.id}/discover`);
  }

  /**
   * Fetches where this server's Discover request is.
   * @returns The request's status, with the reviewers' reason once it's decided.
   */
  public async fetchDiscoverRequest(): Promise<DiscoverRequest> {
    return toDiscoverRequest(await this.client.rest.get(`/servers/${this.id}/discover`));
  }

  /** Withdraws this server's Discover request. Only works while it's still in the queue. */
  public async cancelDiscoverRequest(): Promise<void> {
    await this.client.rest.delete(`/servers/${this.id}/discover`);
  }

  /**
   * Reports this server to Stoat's moderation team.
   * @param reason Why it's being reported.
   * @param options More details for the moderators.
   */
  public async report(reason: ContentReportReason, options?: ReportOptions): Promise<void> {
    await sendReport(this.client, { type: "Server", id: this.id, report_reason: reason }, options);
  }

  /**
   * Leaves the server.
   *
   * Note: the API uses the same route to delete a server, so if the logged-in user owns
   * this server it will be deleted.
   */
  public async leave() {
    return this.client.rest.delete(`/servers/${this.id}`);
  }

  /**
   * Fetch audit logs for this server
   * @param options Query params
   */
  public async fetchAuditLogs(options?: FetchAuditLogsOptions): Promise<Collection<string, AuditLogEntry>> {
    const query: RouteParams<"get", `/servers/${string}/audit_logs`> = {};
    if (options?.user) query.user = options.user;
    if (options?.target) query.target = options.target;
    if (options?.type) query.type = options.type;
    if (options?.before) query.before = options.before;
    if (options?.after) query.after = options.after;
    if (options?.limit) query.limit = options.limit;

    const data = await this.client.rest.get(`/servers/${this.id}/audit_logs`, query);

    for (const user of data.users) this.client.users._add(user);
    for (const member of data.members) this.members._add(member);

    const entries = new Collection<string, AuditLogEntry>();
    for (const raw of data.audit_logs) {
      entries.set(raw._id, new AuditLogEntry(this.client, raw));
    }
    return entries;
  }

  /**
   * Fetches multiple members from this server.
   * @param options Filter options for the fetch request.
   * @returns A Collection of the fetched members.
   */
  public async fetchMembers(options?: FetchMembersOptions) {
    return this.members.fetchMany(options);
  }
}
