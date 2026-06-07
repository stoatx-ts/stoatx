import { User } from "./User";
import type { Client } from "../client/Client";
import { User as RawUser } from "stoat-api";
/**
 * Represents the authenticated bot's user object.
 */
export class ClientUser extends User {
  constructor(client: Client, data: RawUser) {
    super(client, data);
  }
}
