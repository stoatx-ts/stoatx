import { Message } from "./Message";
import { Emoji } from "./Emoji";
import { Collection } from "../utils/Collection";
import { Client } from "../client/Client";
import { User } from "./User";
import { inspectCustom, type InspectFn, type InspectOptions } from "../utils/inspect";

export class MessageReaction {
  public message: Message | { id: string; channelId: string };
  public emoji: Emoji | string;
  public users: Collection<string, User | { id: string }>;

  constructor(
    public client: Client,
    data: { message: Message | { id: string; channelId: string }; emojiId: string; users?: string[] },
  ) {
    this.message = data.message;
    // Attempt to resolve custom emojis from the cache, otherwise fallback to the string (e.g. for unicode)
    this.emoji = this.client.emojis.cache.get(data.emojiId) || data.emojiId;
    this.users = new Collection();

    if (data.users) {
      for (const userId of data.users) {
        const user = this.client.users.cache.get(userId) || { id: userId };
        this.users.set(userId, user as User);
      }
    }
  }

  public get count(): number {
    return this.users.size;
  }

  public async remove(): Promise<void> {
    if (this.message instanceof Message) {
      const emojiId = typeof this.emoji === "string" ? this.emoji : this.emoji.id;
      await this.message.removeReaction(emojiId);
    }
  }

  /**
   * Customizes how Node.js prints this object with `console.log` and `util.inspect`,
   * hiding the circular client reference. Ignored in browsers.
   * @param _depth How many levels deep Node.js is still allowed to print (unused).
   * @param options The inspect options Node.js is printing with.
   * @param inspect Node's `util.inspect`, passed in so this file does not import `node:util`.
   * @internal
   */
  [inspectCustom](_depth: number, options: InspectOptions, inspect: InspectFn) {
    const data = {
      messageId: this.message.id,
      emoji: this.emoji,
      count: this.count,
      users: Array.from(this.users.keys()),
    };
    return `MessageReaction ${inspect(data, options)}`;
  }
}
