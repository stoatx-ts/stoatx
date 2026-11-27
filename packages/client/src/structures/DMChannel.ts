import { BaseChannel } from "./BaseChannel";
import { Client } from "../client/Client";
import { Channel as RawChannel } from "stoat-api";
import type { UserResolvable } from "../managers/UserManager";

export type RawDMChannel = Extract<RawChannel, { channel_type: "DirectMessage" }>;

export class DMChannel extends BaseChannel {
  public active: boolean = false;
  public recipients: string[] = [];
  public lastMessageId: string | null = null;

  constructor(client: Client, data: RawDMChannel) {
    super(client, data);
    this._patch(data);
  }

  public _patch(data: RawDMChannel): void {
    if (data.active !== undefined) this.active = data.active;
    if (data.recipients !== undefined) this.recipients = data.recipients;
    if (data.last_message_id !== undefined) this.lastMessageId = data.last_message_id;
  }

  /**
   * Stops ringing a user for the call in this DM. The logged-in user must be in the call.
   * @param user The user to stop ringing.
   * @throws {StoatAPIError} `NotConnected` if the logged-in user isn't in the call.
   */
  public async stopRinging(user: UserResolvable): Promise<void> {
    await this.client.rest.put(`/channels/${this.id}/end_ring/${this.client.users.resolveId(user)}`);
  }
}
