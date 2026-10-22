import { Base } from "./Base";
import type { Client } from "../client/Client";
import { DataEditWebhook, DataMessageSend, FieldsWebhook, Webhook as APIWebhook, Message as APIMessage } from "stoat-api";
import { Attachment } from "./Attachment";
import { resolveAttachment } from "../utils/resolveAttachment";
import { AttachmentBuilder } from "../builders/AttachmentBuilder";
import { PermissionResolvable, Permissions } from "../utils/permissions";
import { Message, MessageOptions } from "./Message";
import * as console from "node:console";

export interface WebhookEditOptions {
  name?: string;
  avatar?: string | AttachmentBuilder | null;
  permissions?: PermissionResolvable;
  remove?: FieldsWebhook[];
}

export class Webhook extends Base {
  public channelId: string;
  public creatorId: string;
  public name: string;
  public permissions: bigint;
  public avatar: Attachment | null;
  public token: string | null;

  constructor(client: Client, data: APIWebhook) {
    super(client, { _id: data.id });

    this.channelId = data.channel_id;
    this.creatorId = data.creator_id;
    this.name = data.name;
    this.permissions = BigInt(data.permissions);
    this.avatar = data.avatar ? new Attachment(this.client, data.avatar) : null;
    this.token = data.token ?? null;
  }

  /**
   * @internal Called by BaseManager._add() when this webhook is already cached.
   */
  _patch(data: Partial<APIWebhook>): void {
    if (data.name !== undefined) this.name = data.name;
    if (data.permissions !== undefined) this.permissions = BigInt(data.permissions);
    if (data.avatar !== undefined) this.avatar = data.avatar ? new Attachment(this.client, data.avatar) : null;
    if (data.token !== undefined) this.token = data.token ?? null;
  }

  avatarURL(): string | null {
    if (!this.avatar) return null;
    return this.avatar.url;
  }

  /** Edit this webhook's name/avatar (bot auth). */
  async edit(data: WebhookEditOptions): Promise<Webhook> {
    const payload: DataEditWebhook = {};
    const remove: FieldsWebhook[] = [];

    if (data.name !== undefined) payload.name = data.name;
    if (data.avatar !== undefined) {
      if (data.avatar === null) {
        remove.push("Avatar");
      } else {
        const resolvedAvatar = await resolveAttachment(this.client.rest, data.avatar, "avatars");

        if (resolvedAvatar !== undefined) {
          payload.avatar = resolvedAvatar;
        }
      }
    }
    if (data.permissions !== undefined) {
      payload.permissions = new Permissions(data.permissions).valueOf() as number;
    }

    if (remove.length > 0) payload.remove = remove;

    const raw = await this.client.rest.patch(`/webhooks/${this.id}`, payload);
    console.log("Webhook edited:", raw);
    this._patch(raw as any);
    return this;
  }

  /** Delete this webhook. */
  async delete(): Promise<void> {
    console.log("Deleting webhook:", this.id);
    await this.client.rest.delete(`/webhooks/${this.id}`);
  }

  /** Send a message through this webhook. */
  public async send(contentOrOptions: MessageOptions | string): Promise<Message> {
    const opts = typeof contentOrOptions === "string" ? { content: contentOrOptions } : contentOrOptions;

    const payload: DataMessageSend = {};

    if (opts.content) {
      payload.content = opts.content;
    }

    if (opts.attachments && opts.attachments.length > 0) {
      const resolved = await Promise.all(
        opts.attachments.map((attachment) => resolveAttachment(this.client.rest, attachment, "attachments")),
      );

      const validAttachments = resolved.filter((id): id is string => id !== undefined);

      if (validAttachments.length > 0) {
        payload.attachments = validAttachments;
      }
    }
    if (opts.replies) {
      payload.replies = opts.replies;
    }

    if (opts.embeds && opts.embeds.length) {
      payload.embeds = opts.embeds.map((embed: any) => (typeof embed.toJSON === "function" ? embed.toJSON() : embed));
    }

    if (opts.masquerade) {
      payload.masquerade = opts.masquerade;
    }

    if (opts.interactions) {
      payload.interactions = opts.interactions;
    }

    if (opts.flags) {
      payload.flags = opts.flags;
    }

    const data = (await this.client.rest.post(`/webhooks/${this.id}/${this.token}`, payload)) as APIMessage;

    return new Message(this.client, data);
  }
}
