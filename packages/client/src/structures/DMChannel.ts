import { BaseChannel } from "./BaseChannel";
import { Client } from "../client/Client";
import { Channel as RawChannel } from "stoat-api";

export type RawDMChannel = Extract<RawChannel, { channel_type: "DirectMessage" }>;

export class DMChannel extends BaseChannel {
  public active: boolean = false;
  public recipients: string[] = [];
  public lastMessageId: string | null = null;

  constructor(client: Client, data: RawDMChannel) {
    super(client, data);
  }

  public _patch(data: RawDMChannel): void {
    if (data.active !== undefined) this.active = data.active;
    if (data.recipients !== undefined) this.recipients = data.recipients;
    if (data.last_message_id !== undefined) this.lastMessageId = data.last_message_id;
  }
}
