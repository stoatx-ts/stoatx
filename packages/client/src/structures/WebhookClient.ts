import { Client, ClientOptions } from "../client/Client";
import { DataMessageSend, Webhook } from "stoat-api";
import { Message, MessageOptions } from "./Message";
import { resolveAttachment } from "../utils/resolveAttachment";

export interface WebhookClientDataIdWithToken {
  id: string;
  token: string;
}

interface WebhookClientDataUrl {
  url: string;
}

export type WebhookClientData = WebhookClientDataIdWithToken | WebhookClientDataUrl;


export interface WebhookEditOptions {
  name?: string;
  avatar?: string | null;
}


const WEBHOOK_URL_RE = /\/webhooks\/([A-Za-z0-9]+)\/([A-Za-z0-9._-]+)/;

function resolveIdToken(data: WebhookClientData): { id: string; token: string } {
  if ("url" in data) {
    const match = WEBHOOK_URL_RE.exec(data.url);
    if (!match) {
      throw new Error(`Could not parse webhook URL: ${data.url}`);
    }
    const id = match[1];
    const token = match[2];
    if (!id || !token) {
      throw new Error(`Could not parse webhook URL: ${data.url}`);
    }
    return { id, token };

  }
  return { id: data.id, token: data.token };
}

export class WebhookClient extends Client {
  public readonly id: string;
  public readonly token: string;

  constructor(data: WebhookClientData, options: ClientOptions = {}) {
    super(options);

    const { id, token } = resolveIdToken(data);
    this.id = id;
    this.token = token;

    this.rest.setBaseURL(options.apiURL ?? "https://api.stoat.chat");
    this.rest.setToken(this.token);

    if (options.overrides?.cdnURL) {
      this.rest.setCDNURL(options.overrides.cdnURL);
    }
  }

  /** Fetch this webhook's public info (name, avatar, channel). */
  public async fetch(): Promise<Webhook> {
    return await this.rest.get(`/webhooks/${this.id}/${this.token}`);
  }

  /** Edit this webhook's name/avatar. */
  public async edit(data: WebhookEditOptions): Promise<Webhook> {
    return (await this.rest.patch(`/webhooks/${this.id}/${this.token}`, data)) as Webhook;
  }

  /** Delete this webhook. */
  public async delete(): Promise<void> {
    return await this.rest.delete(`/webhooks/${this.id}/${this.token}`);
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
        opts.attachments.map((attachment) => resolveAttachment(this.rest, attachment, "attachments")),
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

    const data = await this.rest.post(`/webhooks/${this.id}/${this.token}`, payload);

    return new Message(this, data!);
  }
}
