import { Client as StoatClient, Message, PermissionResolvable } from "@stoatx/client";
import { Client } from "./client";

export type OptionType = "string" | "number" | "boolean" | "user" | "channel" | "role";

export interface CommandOptionDefinition {
  /** The name of the flag (e.g., "deleteMessages") */
  name: string;
  /** The expected data type */
  type: OptionType;
  /** Whether the user MUST provide this flag */
  required?: boolean;
  /** Description for help menus */
  description?: string;
}

/**
 * Simple command options passed to @SimpleCommand decorator
 * Used with @Stoat() decorated classes for method-based commands
 */
export interface SimpleCommandOptions {
  /** Command name (defaults to method name) */
  name?: string;
  /** Command description */
  description?: string;
  /** Command aliases */
  aliases?: string[];
  /** Required permissions to run the command */
  permissions?: PermissionResolvable[];
  /** Command category (auto-detected from directory if not provided) */
  category?: string;
  /** Cooldown in milliseconds */
  cooldown?: number;
  /** Storage strategy or identifier for cooldowns (e.g. "memory", "database") */
  cooldownStorage?: string;
  /** Whether the command is NSFW only */
  nsfw?: boolean;
  /** Whether the command is owner only */
  ownerOnly?: boolean;
  /** Command options/flags (e.g., --deleteMessages true) */
  options?: CommandOptionDefinition[];
  /** Command args that act like flags without passing flags */
  args?: CommandOptionDefinition[];
}

/**
 * Resolved command metadata with required fields
 */
export interface CommandMetadata {
  name: string;
  description: string;
  aliases: string[];
  permissions: PermissionResolvable[];
  category: string;
  cooldown: number;
  cooldownStorage?: string;
  nsfw: boolean;
  ownerOnly: boolean;
  options?: CommandOptionDefinition[];
  args?: CommandOptionDefinition[];
}

/**
 * Command execution context
 */
export interface CommandContext<
  TOptions = Record<string, string | number | boolean>,
  TArgs extends (string | number | boolean)[] = (string | number | boolean)[],
  TClient extends StoatClient = Client,
> {
  /** The client instance */
  client: TClient;
  /** The raw message content */
  content: string;
  /** The author ID */
  authorId: string;
  /** The channel ID */
  channelId: string;
  /** The server/guild ID (if applicable) */
  serverId?: string | undefined;
  /** Parsed command arguments */
  args: TArgs;
  options?: TOptions;
  /** The prefix used */
  prefix: string;
  /** The command name used (could be an alias) */
  commandName: string;
  /** Reply to the message */
  reply: (content: string) => Promise<Message>;
  /** The original message object (platform-specific) */
  message: Message;
}

/**
 * Optional lifecycle hooks for @Stoat() class instances
 */
export interface StoatLifecycle {
  /** Optional: Called when an error occurs during command execution */
  onError?(ctx: CommandContext<Client>, error: Error): Promise<void> | void;
  /** Optional: Called when a cooldown is active */
  onCooldown?(ctx: CommandContext<Client>, remaining: number): Promise<void> | void;
  /** Optional: Called when user doesn't have the permissions needed */
  onMissingPermissions?(ctx: CommandContext<Client>, missing: PermissionResolvable[]): Promise<void> | void;

  /** Allows the class to contain other methods (such as your commands) */
  [method: string]: any;
}

/**
 * Cooldown manager interface for custom cooldown storage (e.g., database)
 */
export interface CooldownManager {
  check(ctx: CommandContext<any>, metadata: CommandMetadata): boolean | Promise<boolean>;
  getRemaining(ctx: CommandContext<any>, metadata: CommandMetadata): number | Promise<number>;
  set(ctx: CommandContext<any>, metadata: CommandMetadata): void | Promise<void>;
  clear?(): void | Promise<void>;
}

export interface StoatxGuard {
  run(ctx: CommandContext<Client>): Promise<boolean> | boolean;
  guardFail?(ctx: CommandContext<Client>): Promise<void> | void;
}

/**
 * Discovery options for automatic command module loading
 */
export interface StoatxDiscoveryOptions {
  /** Root directories to scan (default: [process.cwd()]) */
  roots?: string[];
  /** Glob patterns relative to each root */
  include?: string[];
  /** Additional ignore patterns */
  ignore?: string[];
}

/**
 * Handler options
 */
export interface StoatxHandlerOptions {
  /** The client instance */
  client: Client;
  /** Directory to scan for command modules (absolute path) */
  commandsDir?: string;
  /** Auto-discovery options used when commandsDir is not provided */
  discovery?: StoatxDiscoveryOptions;
  /** Command prefix or prefix resolver function */
  prefix: string | ((ctx: { serverId?: string | undefined }) => string | Promise<string>);
  /** Owner IDs for owner-only commands */
  owners?: string[];
  /** File extensions to load (default: ['.js', '.mjs', '.cjs']) */
  extensions?: string[];
  /** Disable mention prefix support (default: false) */
  disableMentionPrefix?: boolean;
  /** Custom cooldown manager */
  cooldownManager?: CooldownManager;
  /** * The prefix used to identify flags/options (defaults to "-")
   * @example "+" for +force, "/" for /force
   */
  flagPrefix?: string;
}
