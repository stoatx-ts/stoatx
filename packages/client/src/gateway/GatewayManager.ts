import WebSocket from "ws";
import { Client } from "../client/Client";
import { Message } from "../structures/Message";
import { TextChannel } from "../structures/TextChannel";
import { ClientUser } from "../structures/ClientUser";
import { Emoji } from "../structures/Emoji";
import { Webhook } from "../structures/Webhook";
import { Collection } from "../utils/Collection";
import { StoatGateway } from "../utils/Constants";

export class GatewayManager {
  private ws: WebSocket | null = null;
  private wsURL: string = "";
  private pingInterval: NodeJS.Timeout | null = null;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private token: string | null = null;

  private reconnectAttempts: number = 0;
  private readonly maxReconnectWait: number = 60000; // Cap at 60s
  private isIntentionalClose: boolean = false;

  constructor(private client: Client) {}

  public async connect(token: string): Promise<void> {
    this.token = token;
    this.isIntentionalClose = false;
    this.clearReconnectTimeout();
    this.client.emit("debug", "Connecting to Stoat Gateway...");

    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws = null;
    }

    const baseUrl = this.wsURL || StoatGateway;
    const url = `${baseUrl}?version=1&format=json&token=${this.token}`;

    this.ws = new WebSocket(url);

    this.ws.on("open", () => {
      this.client.emit("debug", "WebSocket Opened. Starting ping loop...");
      this.reconnectAttempts = 0;
      this.startPingLoop();
    });

    this.ws.on("message", (data) => this.handleMessage(data));

    this.ws.on("close", (code, reason) => {
      this.client.emit("debug", `WebSocket closed: ${code} - ${reason.toString()}`);
      if (this.pingInterval) clearInterval(this.pingInterval);
      if (!this.isIntentionalClose) {
        this.reconnect();
      }
    });

    this.ws.on("error", (error) => {
      this.client._reportError(error);
    });
  }

  public setGatewayUrl(url: string) {
    this.wsURL = url;
  }

  private handleMessage(rawData: WebSocket.RawData) {
    let payload: any;
    try {
      payload = JSON.parse(rawData.toString());
    } catch (error) {
      this.client.emit("debug", `Dropped malformed gateway frame: ${(error as Error).message}`);
      return;
    }

    this.safeDispatch(payload);
  }

  private safeDispatch(payload: any) {
    try {
      this.dispatch(payload);
    } catch (error) {
      this.client._reportError(new Error(`Failed to handle gateway event "${payload?.type}"`, { cause: error }));
    }
  }

  private dispatch(payload: any) {
    const eventType = payload.type;

    this.client.emit("raw", payload);

    switch (eventType) {
      case "Error":
        this.client._reportError(new Error(`Gateway Error: ${payload.error || JSON.stringify(payload)}`));
        break;

      case "Bulk": {
        for (const event of payload.v ?? []) {
          this.safeDispatch(event);
        }
        break;
      }

      case "Authenticated":
        this.client.emit("debug", "Successfully authenticated with Stoat.");
        break;

      case "Logout":
        this.client.emit("logout");
        break;

      case "Ready": {
        if (payload.channels) {
          for (const rawChannel of payload.channels) {
            this.client.channels._add(rawChannel);
          }
        }

        if (payload.servers) {
          for (const rawServer of payload.servers) {
            this.client.servers._add(rawServer);
          }
        }

        if (payload.users) {
          for (const rawUser of payload.users) {
            this.client.users._add(rawUser);
            if (rawUser.relationship === "User" && !this.client.user) {
              this.client.user = new ClientUser(this.client, rawUser);
            }
          }
        }

        if (payload.members) {
          for (const rawMember of payload.members) {
            const server = this.client.servers.cache.get(rawMember._id.server);
            const user = this.client.users.cache.get(rawMember._id.user);
            if (server && user) {
              server.members._add({ ...rawMember, user });
            }
          }
        }

        if (payload.emojis) {
          for (const rawEmoji of payload.emojis) {
            if (rawEmoji.parent && rawEmoji.parent.type === "Server") {
              const server = this.client.servers.cache.get(rawEmoji.parent.id);
              if (server) {
                server.emojis._add(rawEmoji);
              }
            }
          }
        }

        this.client.emit("ready", payload);
        break;
      }

      case "Message": {
        if (payload.user) this.client.users._add(payload.user);

        const channel = this.client.channels.cache.get(payload.channel);
        let message;

        if (channel) {
          message = channel.messages._add(payload);

          if ("serverId" in channel) {
            const serverId = (channel as TextChannel).serverId;
            const server = this.client.servers.cache.get(serverId);
            if (server && payload.member && payload.user) {
              server.members._add({ ...payload.member, user: payload.user });
            }
          }
        } else {
          message = new Message(this.client, payload);
        }

        this.client.emit("messageCreate", message);
        break;
      }

      case "MessageUpdate": {
        const channel = this.client.channels.cache.get(payload.channel);
        const existing = channel?.messages.cache.get(payload.id);

        if (existing) {
          const oldMessage = existing._clone();
          existing._patch(payload.data);
          this.client.emit("messageUpdate", oldMessage, existing);
        } else {
          // Only the changed fields are sent, so this message is partial (e.g. author may be missing).
          const newMessage = new Message(this.client, { ...payload.data, _id: payload.id, channel: payload.channel });
          this.client.emit("messageUpdate", null, newMessage);
        }
        break;
      }

      case "MessageAppend": {
        const channel = this.client.channels.cache.get(payload.channel);
        const message = channel?.messages.cache.get(payload.id);

        if (message && payload.append.embeds) {
          const oldMessage = message._clone();
          message.embeds = [...(message.embeds || []), ...payload.append.embeds];
          this.client.emit("messageUpdate", oldMessage, message);
        }
        break;
      }

      case "MessageDelete": {
        const channel = this.client.channels.cache.get(payload.channel);

        let message;

        if (channel) {
          message = channel.messages.cache.get(payload.id);
          channel.messages.cache.delete(payload.id);
        }

        if (message) {
          this.client.emit("messageDelete", message);
        } else {
          this.client.emit("messageDelete", { id: payload.id, channelId: payload.channel });
        }

        break;
      }

      case "BulkMessageDelete": {
        const channel = this.client.channels.cache.get(payload.channel);
        const messages = new Collection<string, Message | { id: string; channelId: string }>();

        for (const id of payload.ids ?? []) {
          const cached = channel?.messages.cache.get(id);
          channel?.messages.cache.delete(id);
          messages.set(id, cached ?? { id, channelId: payload.channel });
        }

        this.client.emit("messageDeleteBulk", messages, payload.channel);
        break;
      }

      case "MessageReact": {
        const channel = this.client.channels.cache.get(payload.channel_id);
        const message = channel?.messages.cache.get(payload.id);

        if (message) {
          if (!message.reactions) message.reactions = {};
          if (!message.reactions[payload.emoji_id]) {
            message.reactions[payload.emoji_id] = [];
          }
          const reactions = message.reactions[payload.emoji_id];
          if (reactions && !reactions.includes(payload.user_id)) {
            reactions.push(payload.user_id);
          }
        }

        this.client.emit(
          "messageReact",
          message || { id: payload.id, channelId: payload.channel_id },
          payload.emoji_id,
          payload.user_id,
        );
        break;
      }

      case "MessageUnreact": {
        const channel = this.client.channels.cache.get(payload.channel_id);
        const message = channel?.messages.cache.get(payload.id);

        if (message && message.reactions && message.reactions[payload.emoji_id]) {
          const reactions = message.reactions[payload.emoji_id];
          if (reactions) {
            message.reactions[payload.emoji_id] = reactions.filter((userId) => userId !== payload.user_id);

            if (message.reactions[payload.emoji_id]!.length === 0) {
              delete message.reactions[payload.emoji_id];
            }
          }
        }

        this.client.emit(
          "messageUnreact",
          message || { id: payload.id, channelId: payload.channel_id },
          payload.emoji_id,
          payload.user_id,
        );
        break;
      }

      case "MessageRemoveReaction": {
        const channel = this.client.channels.cache.get(payload.channel_id);
        const message = channel?.messages.cache.get(payload.id);

        if (message && message.reactions) {
          delete message.reactions[payload.emoji_id];
        }

        this.client.emit(
          "messageRemoveReaction",
          message || { id: payload.id, channelId: payload.channel_id },
          payload.emoji_id,
        );
        break;
      }

      case "Pong":
        this.client.emit("debug", "Received Pong from server.");
        break;

      case "ChannelCreate": {
        const channel = this.client.channels._add(payload);

        this.client.emit("channelCreate", channel);
        break;
      }

      case "ChannelUpdate": {
        const existing = this.client.channels.cache.get(payload.id);

        if (existing) {
          const oldChannel = existing._clone();

          if ("_patch" in existing) {
            (existing as any)._patch(payload.data, payload.clear);
          }

          this.client.emit("channelUpdate", oldChannel, existing);
        } else {
          // Updates only carry the changed fields, which is not enough to build an uncached channel.
          this.client.emit("debug", `Ignoring ChannelUpdate for uncached channel ${payload.id}`);
        }
        break;
      }

      case "ChannelDelete": {
        const channel = this.client.channels.cache.get(payload.id);
        if (channel) {
          this.client.channels.cache.delete(channel.id);
          this.client.emit("channelDelete", channel);
        }
        break;
      }

      case "ServerCreate": {
        const server = this.client.servers._add(payload.server);
        for (const rawChannel of payload.channels ?? []) {
          this.client.channels._add(rawChannel);
        }
        for (const rawEmoji of payload.emojis ?? []) {
          server.emojis._add(rawEmoji);
        }
        this.client.emit("serverCreate", server);
        break;
      }

      case "ServerUpdate": {
        const existing = this.client.servers.cache.get(payload.id);

        if (existing) {
          const oldServer = existing._clone();

          existing._patch(payload.data, payload.clear);

          this.client.emit("serverUpdate", oldServer, existing);
        } else {
          // Updates only carry the changed fields, which is not enough to build an uncached server.
          this.client.emit("debug", `Ignoring ServerUpdate for uncached server ${payload.id}`);
        }
        break;
      }

      case "ServerDelete": {
        const server = this.client.servers.cache.get(payload.id);
        if (server) {
          this.client.servers.cache.delete(payload.id);
          this.client.emit("serverDelete", server);
        } else {
          this.client.emit("serverDelete", payload.id);
        }
        break;
      }

      case "ServerMemberUpdate": {
        const server = this.client.servers.cache.get(payload.id.server);
        const existing = server?.members.cache.get(payload.id.user);

        if (existing) {
          const oldMember = existing._clone();
          existing._patch(payload.data, payload.clear);
          this.client.emit("serverMemberUpdate", oldMember, existing);
        }
        break;
      }

      case "ServerRoleUpdate": {
        const server = this.client.servers.cache.get(payload.id);
        if (!server) break;

        const existing = server.roles.cache.get(payload.role_id);
        if (existing) {
          const oldRole = existing._clone();
          existing._patch(payload.data, payload.clear);
          this.client.emit("serverRoleUpdate", oldRole, existing);
        } else {
          const role = server.roles._add({ ...payload.data, _id: payload.role_id });
          this.client.emit("serverRoleCreate", role);
        }
        break;
      }

      case "ServerRoleDelete": {
        const server = this.client.servers.cache.get(payload.id);
        if (!server) break;

        const role = server.roles.cache.get(payload.role_id);
        server.roles.cache.delete(payload.role_id);

        // The role is gone from every member, so drop it from cached role lists too.
        for (const member of server.members.cache.values()) {
          if (member.roleIds.includes(payload.role_id)) {
            member._patch({ roles: member.roleIds.filter((id) => id !== payload.role_id) } as any);
          }
        }

        this.client.emit("serverRoleDelete", role ?? { id: payload.role_id, serverId: payload.id });
        break;
      }

      case "ServerRoleRanksUpdate": {
        const server = this.client.servers.cache.get(payload.id);
        if (!server) break;

        (payload.ranks as string[]).forEach((roleId, rank) => {
          server.roles.cache.get(roleId)?._patch({ rank } as any);
        });

        this.client.emit("serverRoleRanksUpdate", server);
        break;
      }

      case "ServerMemberJoin": {
        const server = this.client.servers.cache.get(payload.id);
        if (server) {
          const member = server.members._add(payload.member);
          this.client.emit("serverMemberJoin", member);
        }
        break;
      }

      case "ServerMemberLeave": {
        const server = this.client.servers.cache.get(payload.id);
        let member = null;

        if (server) {
          member = server.members.cache.get(payload.user);
          if (member) {
            server.members.cache.delete(payload.user);
          }
        }
        const emitData = member || { serverId: payload.id, userId: payload.user };
        if (payload.reason === "Ban") {
          if (server) {
            const dummyBanPayload = {
              _id: payload.user,
              reason: null,
            };

            server.bans._add(dummyBanPayload);
          }
          this.client.emit("serverBanAdd", emitData);
        } else if (payload.reason === "Kick") {
          this.client.emit("serverMemberKick", emitData);
        } else {
          this.client.emit("serverMemberLeave", emitData);
        }
        break;
      }

      case "EmojiCreate": {
        let emoji;
        if (payload.parent?.type === "Server") {
          const server = this.client.servers.cache.get(payload.parent.id);
          if (server) {
            emoji = server.emojis._add(payload);
          }
        }
        this.client.emit("emojiCreate", emoji ?? new Emoji(this.client, payload));
        break;
      }

      case "EmojiUpdate": {
        const existing = this.findEmoji(payload.id);
        if (existing) {
          const oldEmoji = existing._clone();
          existing._patch(payload.data);
          this.client.emit("emojiUpdate", oldEmoji, existing);
        }
        break;
      }

      case "EmojiDelete": {
        const emoji = this.findEmoji(payload.id);
        this.client.emojis.cache.delete(payload.id);

        for (const server of this.client.servers.cache.values()) {
          if (server.emojis.cache.delete(payload.id)) break;
        }

        this.client.emit("emojiDelete", emoji ?? payload.id);
        break;
      }

      case "ChannelGroupJoin":
      case "ChannelGroupLeave": {
        const channel = this.client.channels.cache.get(payload.id);
        const joined = payload.type === "ChannelGroupJoin";

        if (channel?.isGroup()) {
          const recipients = channel.recipients.filter((id) => id !== payload.user);
          channel._patch({ recipients: joined ? [...recipients, payload.user] : recipients } as any);
        }

        this.client.emit(
          joined ? "channelGroupJoin" : "channelGroupLeave",
          channel ?? { id: payload.id },
          payload.user,
        );
        break;
      }

      case "ChannelStartTyping":
        this.client.emit("typingStart", payload.id, payload.user);
        break;

      case "ChannelStopTyping":
        this.client.emit("typingStop", payload.id, payload.user);
        break;

      case "ChannelAck":
        this.client.emit("channelAck", payload.id, payload.user, payload.message_id);
        break;

      case "WebhookCreate": {
        const channel = this.client.channels.cache.get(payload.channel_id);
        const webhook = channel ? channel.webhooks._add(payload) : new Webhook(this.client, payload);
        this.client.emit("webhookCreate", webhook);
        break;
      }

      case "WebhookUpdate": {
        const existing = this.client.channels.cache.get(payload.channel_id)?.webhooks.cache.get(payload.id);
        if (existing) {
          const oldWebhook = existing._clone();
          existing._patch(payload.data);
          if (payload.remove?.includes("Avatar")) existing.avatar = null;
          this.client.emit("webhookUpdate", oldWebhook, existing);
        }
        break;
      }

      case "WebhookDelete": {
        const webhooks = this.client.channels.cache.get(payload.channel_id)?.webhooks;
        const webhook = webhooks?.cache.get(payload.id);
        webhooks?.cache.delete(payload.id);
        this.client.emit("webhookDelete", webhook ?? { id: payload.id, channelId: payload.channel_id });
        break;
      }

      case "UserUpdate": {
        const existing = this.client.users.cache.get(payload.id);
        const isClientUser = this.client.user?.id === payload.id;

        let oldUser;
        let newUser;

        if (existing) {
          oldUser = existing._clone();
          existing._patch(payload.data, payload.clear);
          newUser = existing;
        }

        if (isClientUser) {
          oldUser = this.client.user?._clone();

          this.client.user?._patch(payload.data, payload.clear);
          newUser = this.client.user;
        }

        if (oldUser && newUser) {
          this.client.emit("userUpdate", oldUser, newUser);
        }

        break;
      }

      case "UserRelationship": {
        const user = this.client.users._add(payload.user);
        this.client.emit("userRelationship", user);
        break;
      }

      case "UserPlatformWipe": {
        this.wipeUser(payload.user_id);
        this.client.emit("userPlatformWipe", payload.user_id, payload.flags);
        break;
      }

      default:
        this.client.emit("debug", `Unhandled Gateway Event Type: ${eventType}`);
        break;
    }
  }

  private findEmoji(id: string): Emoji | undefined {
    const global = this.client.emojis.cache.get(id);
    if (global) return global;
    for (const server of this.client.servers.cache.values()) {
      const emoji = server.emojis.cache.get(id);
      if (emoji) return emoji;
    }
    return undefined;
  }

  /**
   * Removes a banned or deleted user's messages, DMs and server memberships from the cache,
   * as the API asks clients to do on UserPlatformWipe.
   */
  private wipeUser(userId: string) {
    for (const channel of this.client.channels.cache.values()) {
      if (channel.isDM() && channel.recipients.includes(userId)) {
        this.client.channels.cache.delete(channel.id);
        continue;
      }
      for (const [id, message] of channel.messages.cache) {
        if (message.authorId === userId) channel.messages.cache.delete(id);
      }
    }

    for (const server of this.client.servers.cache.values()) {
      server.members.cache.delete(userId);
    }

    this.client.users.cache.get(userId)?._patch({ relationship: "None" } as any);
  }

  private startPingLoop() {
    if (this.pingInterval) clearInterval(this.pingInterval);

    this.pingInterval = setInterval(() => {
      this.client.emit("debug", "Sending Ping...");
      this.send({ type: "Ping", data: Date.now() });
    }, 20000);
  }

  private send(payload: any) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  private reconnect(): void {
    if (!this.token) {
      this.client._reportError(new Error("RECONNECT_FAILED: No token available."));
      return;
    }

    let waitTime = Math.pow(2, this.reconnectAttempts) * 1000;

    const jitter = waitTime * 0.2 * Math.random();
    waitTime = Math.min(waitTime + jitter, this.maxReconnectWait);

    this.reconnectAttempts++;

    this.client.emit(
      "debug",
      `Attempting to reconnect in ${Math.round(waitTime / 1000)}s... (Attempt ${this.reconnectAttempts})`,
    );

    this.clearReconnectTimeout();
    this.reconnectTimeout = setTimeout(() => {
      this.reconnectTimeout = null;
      void this.connect(this.token!);
    }, waitTime);
  }

  private clearReconnectTimeout() {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  public disconnect() {
    this.isIntentionalClose = true;
    this.clearReconnectTimeout();
    this.client.sweepers.stop();
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.ws) {
      this.ws.close(1000, "Client disconnected gracefully");
      this.ws.removeAllListeners();
      this.ws = null;
    }
    this.client.emit("debug", "Gateway disconnected intentionally.");
  }
}
