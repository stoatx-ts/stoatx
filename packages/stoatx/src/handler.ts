import "reflect-metadata";
import { CommandRegistry, RegisteredCommand } from "./registry";
import type {
  CommandContext,
  CommandMetadata,
  ParamSchema,
  StoatxDiscoveryOptions,
  StoatxHandlerOptions,
  CooldownManager,
} from "./types";
import { ClientEvents, Message } from "@stoatx/client";
import { Client } from "./client";
import {
  CommandValidationError,
  FetchFailedError,
  InvalidMentionError,
  InvalidTypeError,
  MissingArgumentError,
  MissingOptionError,
  NoServerContextError,
} from "./error";
import { METADATA_KEYS } from "./decorators";

/**
 * Default in-memory cooldown manager
 */
export class DefaultCooldownManager implements CooldownManager {
  private readonly cooldowns: Map<string, Map<string, number>> = new Map();

  check(ctx: CommandContext, metadata: CommandMetadata): boolean {
    if (metadata.cooldown <= 0) return true;
    const commandCooldowns = this.cooldowns.get(metadata.name);
    if (!commandCooldowns) return true;
    const expirationTime = commandCooldowns.get(ctx.authorId);
    if (!expirationTime) return true;
    if (Date.now() > expirationTime) {
      commandCooldowns.delete(ctx.authorId);
      return true;
    }
    return false;
  }

  getRemaining(ctx: CommandContext, metadata: CommandMetadata): number {
    const commandCooldowns = this.cooldowns.get(metadata.name);
    if (!commandCooldowns) return 0;
    const userCooldown = commandCooldowns.get(ctx.authorId);
    if (!userCooldown) return 0;
    return Math.max(0, userCooldown - Date.now());
  }

  set(ctx: CommandContext, metadata: CommandMetadata): void {
    if (!this.cooldowns.has(metadata.name)) {
      this.cooldowns.set(metadata.name, new Map());
    }
    const commandCooldowns = this.cooldowns.get(metadata.name)!;
    commandCooldowns.set(ctx.authorId, Date.now() + metadata.cooldown);
  }

  clear(): void {
    this.cooldowns.clear();
  }
}

/**
 * StoatxHandler - The execution engine for commands
 * @internal
 */
export class StoatxHandler {
  private readonly commandsDir: string | undefined;
  private readonly discoveryOptions: StoatxDiscoveryOptions | undefined;
  private readonly prefixResolver: string | ((ctx: { serverId?: string | undefined }) => string | Promise<string>);
  private readonly owners: Set<string>;
  private readonly registry: CommandRegistry;
  private readonly cooldownManager: CooldownManager;
  private readonly disableMentionPrefix: boolean;
  private readonly client: Client;
  private readonly flagPrefix: string;
  private readonly globalGuards: Function[];

  constructor(options: StoatxHandlerOptions) {
    this.client = options.client;
    this.commandsDir = options.commandsDir;
    this.discoveryOptions = options.discovery;
    this.prefixResolver = options.prefix;
    this.owners = new Set(options.owners ?? []);
    this.registry = new CommandRegistry(options.extensions);
    this.disableMentionPrefix = options.disableMentionPrefix ?? false;
    this.cooldownManager = options.cooldownManager ?? new DefaultCooldownManager();
    this.flagPrefix = options.flagPrefix || "-";
    this.globalGuards = options.globalGuards ?? [];
  }

  async init(): Promise<void> {
    if (this.commandsDir) {
      await this.registry.loadFromDirectory(this.commandsDir);
    } else {
      await this.registry.autoDiscover(this.discoveryOptions);
    }
    this.attachEvents();
  }

  private attachEvents(): void {
    const events = this.registry.getEvents();
    for (const eventDef of events) {
      const handler = async (...args: any[]) => {
        try {
          await (eventDef.instance as any)[eventDef.methodName](...args, this.client);
        } catch (error) {
          console.error(
            `[Stoatx] Event Handler Error in @${eventDef.type === "on" ? "On" : "Once"}('${eventDef.event}'):`,
            error,
          );
        }
      };
      const eventName = eventDef.event as keyof ClientEvents;
      if (eventDef.type === "once") {
        this.client.once(eventName, handler);
      } else {
        this.client.on(eventName, handler);
      }
    }
  }

  private parseRawInput(rawArgs: string[]): { args: string[]; flags: Record<string, string | boolean> } {
    const args: string[] = [];
    const flags: Record<string, string | boolean> = {};

    for (let i = 0; i < rawArgs.length; i++) {
      const arg = rawArgs[i];
      if (arg === undefined) continue;

      if (arg.startsWith(this.flagPrefix)) {
        let key = arg;
        while (key.startsWith(this.flagPrefix)) {
          key = key.slice(this.flagPrefix.length);
        }
        const nextArg = rawArgs[i + 1];
        if (nextArg !== undefined && !nextArg.startsWith(this.flagPrefix)) {
          flags[key] = nextArg;
          i++;
        } else {
          flags[key] = true;
        }
      } else {
        args.push(arg);
      }
    }

    return { args, flags };
  }

  async parseMessage(
    rawContent: string,
    message: Message,
    meta: {
      authorId: string;
      channelId: string;
      serverId?: string | undefined;
      reply: (content: string) => Promise<Message>;
    },
  ): Promise<(CommandContext & { _rawArgs: string[]; _rawFlags: Record<string, string | boolean> }) | null> {
    const prefix = await this.resolvePrefix(meta.serverId);
    let usedPrefix = prefix;
    let withoutPrefix = "";

    if (rawContent.startsWith(prefix)) {
      withoutPrefix = rawContent.slice(prefix.length).trim();
      usedPrefix = prefix;
    } else if (!this.disableMentionPrefix && rawContent.match(/^<@!?[\w]+>/)) {
      const mentionMatch = rawContent.match(/^<@!?([\w]+)>\s*/);
      if (mentionMatch) {
        const mentionedId = mentionMatch[1];
        const botId = this.client.user?.id;
        if (botId && mentionedId === botId) {
          usedPrefix = mentionMatch[0];
          withoutPrefix = rawContent.slice(mentionMatch[0].length).trim();
        }
      }
    }

    if (!withoutPrefix) return null;

    const [commandName, ...rawArgs] = withoutPrefix.split(/\s+/);
    if (!commandName) return null;

    const { args, flags } = this.parseRawInput(rawArgs);

    return {
      client: this.client,
      content: rawContent,
      authorId: meta.authorId,
      channelId: meta.channelId,
      serverId: meta.serverId,
      prefix: usedPrefix,
      commandName: commandName.toLowerCase(),
      reply: meta.reply,
      message,
      _rawArgs: args,
      _rawFlags: flags,
    };
  }

  async handle(message: Message): Promise<boolean> {
    if (!message.channel || !message.author || !message.content) return false;
    if (message.author.bot) return false;

    const rawContent = message.content;
    const authorId = message.author.id;
    const channelId = message.channel.id;
    const serverId = message.server?.id;
    const reply = async (content: string) => await message.channel!.send(content);

    await this.handleMessage(rawContent, message, { authorId, channelId, serverId, reply });
    return true;
  }

  async handleMessage(
    rawContent: string,
    message: Message,
    meta: {
      authorId: string;
      channelId: string;
      serverId?: string | undefined;
      reply: (content: string) => Promise<Message>;
    },
  ): Promise<void> {
    const ctx = await this.parseMessage(rawContent, message, meta);
    if (!ctx) return;
    await this.execute(ctx);
  }

  async execute(
    ctx: CommandContext & { _rawArgs: string[]; _rawFlags: Record<string, string | boolean> },
  ): Promise<boolean> {
    const registered = this.registry.get(ctx.commandName);
    if (!registered) return false;

    const { instance, metadata, methodName, classConstructor } = registered;

    // Owner-only check
    if (metadata.ownerOnly && !this.owners.has(ctx.authorId)) {
      await ctx.reply("This command is owner-only.");
      return false;
    }

    // Permissions check
    if (metadata.permissions.length > 0) {
      const server = ctx.message.server;
      const member = server ? await server.members.fetch(ctx.authorId) : null;
      if (!member || !member.permissions.has(metadata.permissions)) {
        if (typeof (instance as any).onMissingPermissions === "function") {
          const missing = member?.permissions.missing(metadata.permissions) || [];
          await (instance as any).onMissingPermissions(ctx, missing);
        } else {
          await ctx.reply("You do not have permission to use this command.");
        }
        return false;
      }
    }

    // Guard checks
    const globalGuards = this.globalGuards;

    const classGuards: Function[] = Reflect.getMetadata(METADATA_KEYS.GUARDS, classConstructor) || [];

    const methodGuards: Function[] = Reflect.getMetadata(METADATA_KEYS.GUARDS, instance, methodName) || [];

    const allGuards = [...globalGuards, ...classGuards, ...methodGuards];

    for (const guardClass of allGuards) {
      const guardInstance = new (guardClass as any)();
      if (typeof guardInstance.run === "function") {
        const guardResult = await guardInstance.run(ctx);
        if (!guardResult) {
          if (typeof guardInstance.guardFail === "function") {
            await guardInstance.guardFail(ctx);
          } else {
            console.error("[Stoatx] Guard check failed but no guardFail method defined on", guardClass.name);
          }
          return false;
        }
      }
    }

    // Cooldown check
    if (!(await this.cooldownManager.check(ctx, metadata))) {
      const remaining = await this.cooldownManager.getRemaining(ctx, metadata);
      if (typeof (instance as any).onCooldown === "function") {
        await (instance as any).onCooldown(ctx, remaining);
      } else {
        await ctx.reply(`Please wait ${(remaining / 1000).toFixed(1)} seconds before using this command again.`);
      }
      return false;
    }

    // Resolve parameters
    const resolvedParams = await this.resolveParams(metadata.params, ctx, instance);
    if (resolvedParams === null) return false;

    try {
      if (metadata.cooldown > 0) {
        await this.cooldownManager.set(ctx, metadata);
      }
      await (instance as any)[methodName](...resolvedParams);
      return true;
    } catch (error) {
      if (typeof (instance as any).onError === "function") {
        await (instance as any).onError(ctx, error as Error);
      } else {
        console.error(`[Stoatx] Error in command ${metadata.name}:`, error);
        await ctx.reply("Something went wrong. Please try again later.");
      }
      return false;
    }
  }

  /**
   * Report a validation error to the instance via onValidationError → onError → default reply
   */
  private async reportValidationError(
    instance: object,
    ctx: CommandContext,
    error: CommandValidationError,
  ): Promise<null> {
    if (typeof (instance as any).onValidationError === "function") {
      await (instance as any).onValidationError(ctx, error);
    } else if (typeof (instance as any).onError === "function") {
      await (instance as any).onError(ctx, error);
    } else {
      await ctx.reply(error.message);
    }
    return null;
  }

  private async resolveParams(
    params: ParamSchema[],
    ctx: CommandContext & { _rawArgs: string[]; _rawFlags: Record<string, string | boolean> },
    instance: object,
  ): Promise<any[] | null> {
    const resolved: any[] = new Array(params.length);
    let argCursor = 0;

    for (const param of params) {
      if (param.kind === "ctx") {
        resolved[param.index] = ctx;
        continue;
      }

      if (param.kind === "arg") {
        const rawValue = ctx._rawArgs[argCursor++];

        if (rawValue === undefined) {
          if (param.required) {
            const paramName = param.name ?? `arg[${param.index}]`;
            return this.reportValidationError(instance, ctx, new MissingArgumentError(paramName));
          }
          resolved[param.index] = undefined;
          continue;
        }

        const value = await this.resolveValue(rawValue, param, ctx, instance, "arg");
        if (value === null) return null;
        resolved[param.index] = value;
        continue;
      }

      if (param.kind === "option") {
        const rawValue = ctx._rawFlags[param.name!];

        if (rawValue === undefined) {
          if (param.required) {
            return this.reportValidationError(instance, ctx, new MissingOptionError(param.name!, this.flagPrefix));
          }
          resolved[param.index] = undefined;
          continue;
        }

        const value = await this.resolveValue(String(rawValue), param, ctx, instance, "option");
        if (value === null) return null;
        resolved[param.index] = value;
      }
    }

    return resolved;
  }

  private async resolveValue(
    rawValue: string,
    param: ParamSchema,
    ctx: CommandContext,
    instance: object,
    kind: "arg" | "option",
  ): Promise<any | null> {
    const paramName = kind === "arg" ? (param.name ?? `arg[${param.index}]`) : param.name!;

    switch (param.resolvedType) {
      case "string":
        return String(rawValue);

      case "number": {
        const num = Number(rawValue);
        if (isNaN(num)) {
          return this.reportValidationError(instance, ctx, new InvalidTypeError(paramName, kind, "a number", rawValue));
        }
        return num;
      }

      case "boolean":
        return rawValue === "false" ? false : Boolean(rawValue);

      case "user": {
        const match = rawValue.match(/^(?:<@!?)?([0-7][0-9A-HJKMNP-TV-Z]{25})>?$/i);
        if (!match) {
          return this.reportValidationError(instance, ctx, new InvalidMentionError(paramName, kind, "user", rawValue));
        }
        const userId = match[1]!;
        if (param.fetch) {
          try {
            return await this.client.users.fetch(userId);
          } catch {
            return this.reportValidationError(instance, ctx, new FetchFailedError(paramName, kind, "user", userId));
          }
        }
        return this.client.users.cache.get(userId) ?? userId;
      }

      case "channel": {
        const match = rawValue.match(/^(?:<#)?([0-7][0-9A-HJKMNP-TV-Z]{25})>?$/i);
        if (!match) {
          return this.reportValidationError(
            instance,
            ctx,
            new InvalidMentionError(paramName, kind, "channel", rawValue),
          );
        }
        const channelId = match[1]!;
        if (param.fetch) {
          try {
            return await this.client.channels.fetch(channelId);
          } catch {
            return this.reportValidationError(
              instance,
              ctx,
              new FetchFailedError(paramName, kind, "channel", channelId),
            );
          }
        }
        return this.client.channels.cache.get(channelId) ?? channelId;
      }

      case "role": {
        const match = rawValue.match(/^(?:<@&)?([0-7][0-9A-HJKMNP-TV-Z]{25})>?$/i);
        if (!match) {
          return this.reportValidationError(instance, ctx, new InvalidMentionError(paramName, kind, "role", rawValue));
        }
        const roleId = match[1]!;
        if (param.fetch) {
          const server = ctx.message.server;
          if (!server) {
            return this.reportValidationError(instance, ctx, new NoServerContextError(paramName, kind));
          }
          try {
            return await server.roles.fetch(roleId);
          } catch {
            return this.reportValidationError(instance, ctx, new FetchFailedError(paramName, kind, "role", roleId));
          }
        }
        return ctx.message.server?.roles.cache.get(roleId) ?? roleId;
      }

      default:
        return rawValue;
    }
  }

  getRegistry(): CommandRegistry {
    return this.registry;
  }

  getCommand(name: string): RegisteredCommand | undefined {
    return this.registry.get(name);
  }

  getCommands(): RegisteredCommand[] {
    return this.registry.getAll();
  }

  async reload(): Promise<void> {
    this.registry.clear();
    if (this.cooldownManager.clear) {
      await this.cooldownManager.clear();
    }
    if (this.commandsDir) {
      await this.registry.loadFromDirectory(this.commandsDir);
      return;
    }
    await this.registry.autoDiscover(this.discoveryOptions);
  }

  isOwner(userId: string): boolean {
    return this.owners.has(userId);
  }

  addOwner(userId: string): void {
    this.owners.add(userId);
  }

  removeOwner(userId: string): void {
    this.owners.delete(userId);
  }

  private async resolvePrefix(serverId?: string | undefined): Promise<string> {
    if (typeof this.prefixResolver === "function") {
      return this.prefixResolver({ serverId });
    }
    return this.prefixResolver;
  }
}
