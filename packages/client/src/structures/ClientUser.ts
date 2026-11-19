import { User } from "./User";
import type { Client } from "../client/Client";
import { User as RawUser } from "stoat-api";
/**
 * Represents the logged-in user: the bot, or the user account for user sessions.
 */
export class ClientUser extends User {
  constructor(client: Client, data: RawUser) {
    super(client, data);
  }
}
