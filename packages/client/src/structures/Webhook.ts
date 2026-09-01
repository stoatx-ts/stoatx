import { Base } from "./Base";
import type { Client } from "../client/Client";
import { DataEditWebhook, FieldsWebhook, Webhook as APIWebhook } from "stoat-api";
import { Attachment } from "./Attachment";
import { resolveAttachment } from "../utils/resolveAttachment";
import { AttachmentBuilder } from "../builders/AttachmentBuilder";

export interface WebhookEditOptions {
  name?: string;
  avatar?: string | AttachmentBuilder | null;
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

    if (remove.length > 0) payload.remove = remove;

    const raw = await this.client.rest.patch(`/webhooks/${this.id}`, payload);
    this._patch(raw as any);
    return this;
  }

  /** Delete this webhook. */
  async delete(): Promise<void> {
    await this.client.rest.delete(`/webhooks/${this.id}`);
  }
}
