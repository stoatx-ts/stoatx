import { Client as StoatClient, ClientOptions, Message } from "@stoatx/client";
import type { StoatxHandlerOptions } from "./types";
import { StoatxHandler } from "./handler";

/**
 * Client - An extended Client that integrates StoatxHandler directly
 *
 * @example
 * ```ts
 * import { Client } from 'stoatx';
 *
 * const client = new Client({
 *   prefix: '!',
 *   owners: ['owner-user-id'],
 * });
 *
 * await client.initCommands();
 * ```
 */
export class Client extends StoatClient {
  public readonly handler: StoatxHandler;

  constructor(options: Omit<StoatxHandlerOptions, "client"> & ClientOptions) {
    super(options);
    this.handler = new StoatxHandler({ ...options, client: this });
  }

  override async login(token: string): Promise<string> {
    await this.handler.init();
    return super.login(token);
  }

  async executeCommand(message: Message): Promise<void> {
    await this.handler.handle(message);
  }
}
