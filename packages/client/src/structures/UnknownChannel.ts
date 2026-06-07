import { BaseChannel } from "./BaseChannel";
import type { Client } from "../client/Client";
import type { Channel as RawChannel } from "stoat-api";
/**
 * A fallback class for channel types that are not yet officially supported by the library.
 */
export class UnknownChannel extends BaseChannel {
  constructor(client: Client, data: RawChannel) {
    super(client, data);
  }
}
