import { TextChannel } from "../structures/TextChannel";
import { BaseChannel } from "../structures/BaseChannel";
import type { Client } from "../client/Client";
import { UnknownChannel } from "../structures/UnknownChannel";
import { DMChannel } from "../structures/DMChannel";
import { GroupChannel } from "../structures/GroupChannel";
import {Channel as RawChannel} from "stoat-api";

export function createChannel(client: Client, data: RawChannel): BaseChannel {
  switch (data.channel_type) {
    case "TextChannel":
      return new TextChannel(client, data);
    case "DirectMessage":
      return new DMChannel(client, data);
    case "Group":
      return new GroupChannel(client, data);
    default:
      client.emit("debug", `Received unknown channel type: ${data.channel_type}`);
      return new UnknownChannel(client, data);
  }
}
