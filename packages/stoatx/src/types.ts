import { Client as StoatClient, Message, PermissionResolvable, User, BaseChannel, Role } from "@stoatx/client";
import { Client } from "./client";
import { CommandValidationError } from "./error";

/**
 * Resolved parameter type from reflect-metadata or explicit decorator config
 */
export type ResolvedParamType = "string" | "number" | "boolean" | "user" | "channel" | "role" | "ctx";

/**
 * Schema for a single method parameter decorated with @Arg, @Option, or inferred as ctx
 */
export interface ParamSchema {
  index: number;
  kind: "arg" | "option" | "ctx";
  resolvedType: ResolvedParamType;
  name?: string;
  required?: boolean | undefined;
  fetch?: boolean | undefined;
}

/**
 * Simple command options passed to @SimpleCommand decorator
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
}

export interface GroupOptions {
  name: string;
  description?: string;
  permissions?: PermissionResolvable[];
  ownerOnly?: boolean;
  cooldown?: number;
  nsfw?: boolean;
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
  /** Parameter schema built at scan time from @Arg/@Option decorators */
  params: ParamSchema[];
}

/**
 * Command execution context — carries message context only.
 * Args and options are injected directly as typed method parameters.
 */
export interface CommandContext<TClient extends StoatClient = Client> {
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
  /** The prefix used */
  prefix: string;
  /** The command name used (could be an alias) */
  commandName: string;
  /** Reply to the message */
  reply: (content: string) => Promise<Message>;
  /** The original message object */
  message: Message;
}

/**
 * Optional lifecycle hooks for @Stoat() class instances
 */
export interface StoatLifecycle {
  onError?(ctx: CommandContext, error: Error): Promise<void> | void;
  onValidationError?(ctx: CommandContext, error: CommandValidationError): Promise<void> | void;
  onCooldown?(ctx: CommandContext, remaining: number): Promise<void> | void;
  onMissingPermissions?(ctx: CommandContext, missing: PermissionResolvable[]): Promise<void> | void;
  [method: string]: any;
}

export interface GuardInterface {
  run(ctx: CommandContext): Promise<boolean> | boolean;
  guardFail?(ctx: CommandContext): Promise<void> | void;
}

/**
 * Cooldown manager interface for custom cooldown storage
 */
export interface CooldownManager {
  check(ctx: CommandContext, metadata: CommandMetadata): boolean | Promise<boolean>;
  getRemaining(ctx: CommandContext, metadata: CommandMetadata): number | Promise<number>;
  set(ctx: CommandContext, metadata: CommandMetadata): void | Promise<void>;
  clear?(): void | Promise<void>;
}

export interface StoatxGuard {
  run(ctx: CommandContext): Promise<boolean> | boolean;
  guardFail?(ctx: CommandContext): Promise<void> | void;
}

/**
 * Discovery options for automatic command module loading
 */
export interface StoatxDiscoveryOptions {
  roots?: string[];
  include?: string[];
  ignore?: string[];
}

/**
 * Handler options
 */
export interface StoatxHandlerOptions {
  client: Client;
  commandsDir?: string;
  discovery?: StoatxDiscoveryOptions;
  prefix: string | ((ctx: { serverId?: string | undefined }) => string | Promise<string>);
  owners?: string[];
  extensions?: string[];
  disableMentionPrefix?: boolean;
  cooldownManager?: CooldownManager;
  flagPrefix?: string;
  globalGuards?: Function[];
}

/**
 * Map from reflect-metadata design:paramtypes constructor to resolved param type
 */
export const PARAM_TYPE_MAP = new Map<Function, ResolvedParamType>([
  [String, "string"],
  [Number, "number"],
  [Boolean, "boolean"],
  [User, "user"],
  [BaseChannel, "channel"],
  [Role, "role"],
]);
