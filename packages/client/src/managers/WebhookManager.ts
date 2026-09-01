import { Collection } from "../utils/Collection";
import type { Client } from "../client/Client";
import type { BaseChannel } from "../structures/BaseChannel";
import { BaseManager } from "./BaseManager";
import { Webhook } from "../structures/Webhook";
import type { Webhook as APIWebhook } from "stoat-api";
import { resolveAttachment } from "../utils/resolveAttachment";
import { AttachmentBuilder } from "../builders/AttachmentBuilder";

export type WebhookResolvable = Webhook | string;

export interface WebhookCreateOptions {
  name: string;
  avatar?: string | AttachmentBuilder | null;
}

export class WebhookManager extends BaseManager<string, Webhook, APIWebhook> {
  constructor(
    client: Client,
    public channel: BaseChannel,
    limit: number = Infinity,
  ) {
    super(client, limit);
  }

  /**
   * Tell BaseManager how to find the ID for Webhooks
   */
  protected extractId(data: APIWebhook): string {
    return data.id;
  }

  /**
   * Tell BaseManager how to build a Webhook
   */
  protected construct(data: APIWebhook): Webhook {
    return new Webhook(this.client, data);
  }

  /**
   * Lists all webhooks for this channel (bot auth).
   */
  public async fetchMany(): Promise<Collection<string, Webhook>> {
    const data = await this.client.rest.get(`/channels/${this.channel.id}/webhooks`);

    const fetched = new Collection<string, Webhook>();
    for (const raw of data as APIWebhook[]) {
      const webhook = this._add(raw);
      fetched.set(webhook.id, webhook);
    }
    return fetched;
  }

  /**
   * Creates a new webhook in this channel.
   * @example
   * const webhook = await channel.webhooks.create({ name: "Deploy Bot" });
   */
  public async create(options: WebhookCreateOptions): Promise<Webhook> {
    const payload: Record<string, unknown> = { name: options.name };

    if (options.avatar) {
      const avatarId = await resolveAttachment(this.client.rest, options.avatar, "avatars" as any);
      if (avatarId) payload.avatar = avatarId;
    }

    const data = await this.client.rest.post(`/channels/${this.channel.id}/webhooks`, payload as any);
    return this._add(data as APIWebhook);
  }

  public resolveId(webhook: WebhookResolvable): string {
    if (typeof webhook === "string") return webhook;
    if (webhook instanceof Webhook) return webhook.id;
    throw new Error("Invalid WebhookResolvable: must be a Webhook object or a string ID.");
  }

  /** Delete a webhook by object or ID (bot auth). */
  public async delete(webhook: WebhookResolvable): Promise<void> {
    const id = this.resolveId(webhook);
    await this.client.rest.delete(`/webhooks/${id}`);
    this.cache.delete(id);
  }
}
