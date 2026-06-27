import * as path from "node:path";
import * as fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { glob } from "tinyglobby";
import { buildSimpleCommandMetadata, getSimpleCommands, getEventsMetadata, METADATA_KEYS } from "./decorators";
import { getArgs } from "./decorators/Arg";
import { getOptions } from "./decorators/Option";
import { decoratorStore } from "./decorators/store";
import type { CommandMetadata, GuardInterface, ParamSchema } from "./types";
import { PARAM_TYPE_MAP } from "./types";
import { StoatxContainer } from "./di/Container";

interface AutoDiscoveryOptions {
  roots?: string[];
  include?: string[];
  ignore?: string[];
}

export interface RegisteredCommand {
  instance: object;
  metadata: CommandMetadata;
  methodName: string;
  classConstructor: Function;
}

export interface RegisteredEvent {
  instance: object;
  methodName: string;
  event: string;
  type: "on" | "once";
}

export class CommandRegistry {
  private static readonly DEFAULT_AUTO_DISCOVERY_IGNORES = [
    "**/node_modules/**",
    "**/.git/**",
    "**/*.d.ts",
    "**/*.test.*",
    "**/*.spec.*",
  ];

  private readonly commands: Map<string, RegisteredCommand> = new Map();
  private readonly aliases: Map<string, string> = new Map();
  private readonly registeredEvents: RegisteredEvent[] = [];
  private readonly extensions: string[];
  private readonly processedStoatClasses: Set<Function> = new Set();
  private readonly container: StoatxContainer;

  constructor(container: StoatxContainer, extensions: string[] = [".js", ".mjs", ".cjs"]) {
    this.container = container;
    this.extensions = extensions;
  }

  get size(): number {
    return this.commands.size;
  }

  async loadFromDirectory(directory: string): Promise<void> {
    const patterns = this.extensions.map((ext) => path.join(directory, "**", `*${ext}`).replace(/\\/g, "/"));

    for (const pattern of patterns) {
      const files = await glob(pattern, {
        ignore: ["**/*.d.ts", "**/*.test.ts", "**/*.spec.ts"],
        absolute: true,
      });

      for (const file of files) {
        await this.loadFile(file, directory);
      }
    }

    console.log(`[Stoatx] Loaded ${this.commands.size} command(s) and ${this.registeredEvents.length} event(s)`);
  }

  async autoDiscover(options: AutoDiscoveryOptions = {}): Promise<void> {
    const roots = options.roots?.length ? options.roots : [process.cwd()];
    const includePatterns = options.include?.length ? options.include : this.getDefaultAutoDiscoveryPatterns();

    const patterns = roots.flatMap((root) =>
      includePatterns.map((pattern) => path.join(root, pattern).replace(/\\/g, "/")),
    );

    const files = await glob(patterns, {
      ignore: [...CommandRegistry.DEFAULT_AUTO_DISCOVERY_IGNORES, ...(options.ignore ?? [])],
      absolute: true,
    });

    const uniqueFiles = [...new Set(files)];
    for (const file of uniqueFiles) {
      if (!(await this.isLikelyCommandModule(file))) {
        continue;
      }

      const baseDir =
        roots.find((root) => {
          const relative = path.relative(root, file);
          return relative && !relative.startsWith("..") && !path.isAbsolute(relative);
        }) ?? roots[0]!;
      await this.loadFile(file, baseDir);
    }

    console.log(`[Stoatx] Loaded ${this.commands.size} command(s) and ${this.registeredEvents.length} event(s)`);
  }

  private getDefaultAutoDiscoveryPatterns(): string[] {
    return this.extensions.map((ext) => `**/*${ext}`);
  }

  private async isLikelyCommandModule(filePath: string): Promise<boolean> {
    try {
      const source = await fs.readFile(filePath, "utf8");
      return source.includes("Stoat") || source.includes("SimpleCommand") || source.includes("stoatx:command");
    } catch {
      return true;
    }
  }

  register(instance: object, metadata: CommandMetadata, classConstructor: Function, methodName: string): void {
    const name = metadata.name.toLowerCase();

    if (this.commands.has(name)) {
      console.warn(`[Stoatx] Duplicate command name: ${name}. Skipping...`);
      return;
    }

    this.validateGuards(classConstructor, metadata.name);
    this.commands.set(name, { instance, metadata, methodName, classConstructor });

    for (const alias of metadata.aliases) {
      const aliasLower = alias.toLowerCase();
      if (this.aliases.has(aliasLower) || this.commands.has(aliasLower)) {
        console.warn(`[Stoatx] Duplicate alias: ${aliasLower}. Skipping...`);
        continue;
      }
      this.aliases.set(aliasLower, name);
    }
  }

  get(name: string): RegisteredCommand | undefined {
    const lowerName = name.toLowerCase();
    const resolvedName = this.aliases.get(lowerName) ?? lowerName;
    return this.commands.get(resolvedName);
  }

  has(name: string): boolean {
    const lowerName = name.toLowerCase();
    return this.commands.has(lowerName) || this.aliases.has(lowerName);
  }

  getAll(): RegisteredCommand[] {
    return Array.from(this.commands.values());
  }

  getAllMetadata(): CommandMetadata[] {
    return this.getAll().map((c) => c.metadata);
  }

  getEvents(): RegisteredEvent[] {
    return this.registeredEvents;
  }

  getByCategory(): Map<string, RegisteredCommand[]> {
    const categories = new Map<string, RegisteredCommand[]>();

    for (const cmd of this.commands.values()) {
      const category = cmd.metadata.category;
      const existing = categories.get(category) ?? [];
      existing.push(cmd);
      categories.set(category, existing);
    }

    return categories;
  }

  clear(): void {
    this.commands.clear();
    this.aliases.clear();
    this.registeredEvents.length = 0;
    this.processedStoatClasses.clear();
  }

  [Symbol.iterator](): IterableIterator<[string, RegisteredCommand]> {
    return this.commands.entries();
  }

  values(): IterableIterator<RegisteredCommand> {
    return this.commands.values();
  }

  keys(): IterableIterator<string> {
    return this.commands.keys();
  }

  private validateGuards(commandClass: Function, commandName: string): void {
    const guards: Function[] = Reflect.getMetadata(METADATA_KEYS.GUARDS, commandClass) || [];

    for (const GuardClass of guards) {
      const guardInstance = this.container.resolve<GuardInterface>(GuardClass);

      if (typeof guardInstance.run !== "function") {
        console.error(
          `[Stoatx] FATAL: Guard "${GuardClass.name}" on command "${commandName}" does not have a run() method.`,
        );
        process.exit(1);
      }

      if (typeof guardInstance.guardFail !== "function") {
        console.error(
          `[Stoatx] FATAL: Guard "${GuardClass.name}" on command "${commandName}" does not have a guardFail() method.`,
        );
        process.exit(1);
      }
    }
  }

  private async loadFile(filePath: string, baseDir: string): Promise<void> {
    try {
      const knownStoatClasses = new Set(decoratorStore.getStoatClasses().keys());
      const fileUrl = pathToFileURL(filePath).href;
      await import(fileUrl);

      const allStoatClasses = decoratorStore.getStoatClasses();
      for (const [stoatClass] of allStoatClasses.entries()) {
        if (knownStoatClasses.has(stoatClass) || this.processedStoatClasses.has(stoatClass)) {
          continue;
        }
        this.registerStoatClassCommands(stoatClass, filePath, baseDir);
      }
    } catch (error) {
      console.error(`[Stoatx] Failed to load command file: ${filePath}`, error);
    }
  }

  private registerStoatClassCommands(stoatClass: Function, filePath: string, baseDir: string): void {
    const instance = this.container.resolve<object>(stoatClass);
    const simpleCommands = getSimpleCommands(stoatClass);
    const events = getEventsMetadata(stoatClass);
    const category = this.getCategoryFromPath(filePath, baseDir);

    if (simpleCommands.length === 0 && events.length === 0) {
      console.warn(
        `[Stoatx] Class ${stoatClass.name} is decorated with @Stoat but has no @SimpleCommand, @On or @Once methods. Skipping...`,
      );
      this.processedStoatClasses.add(stoatClass);
      return;
    }

    for (const cmdDef of simpleCommands) {
      const method = (instance as any)[cmdDef.methodName];
      if (typeof method !== "function") {
        console.warn(`[Stoatx] Method ${cmdDef.methodName} not found on ${stoatClass.name}. Skipping...`);
        continue;
      }

      const params = this.buildParamSchema(stoatClass.prototype, cmdDef.methodName);
      const metadata = buildSimpleCommandMetadata(cmdDef.options, cmdDef.methodName, category, params);
      this.register(instance, metadata, stoatClass, cmdDef.methodName);
    }

    for (const eventDef of events) {
      const method = (instance as any)[eventDef.methodName];
      if (typeof method !== "function") {
        console.warn(`[Stoatx] Method ${eventDef.methodName} not found on ${stoatClass.name}. Skipping...`);
        continue;
      }

      this.registeredEvents.push({
        instance,
        methodName: eventDef.methodName,
        event: eventDef.event,
        type: eventDef.type,
      });
    }

    this.processedStoatClasses.add(stoatClass);
  }

  /**
   * Build the parameter schema for a command method by combining
   * reflect-metadata param types with @Arg/@Option decorator metadata.
   */
  private buildParamSchema(prototype: object, methodName: string): ParamSchema[] {
    // Reflected constructor list for each parameter position
    const paramTypes: Function[] = Reflect.getMetadata("design:paramtypes", prototype, methodName) ?? [];

    const argDefs = getArgs(prototype, methodName);
    const optionDefs = getOptions(prototype, methodName);

    // Index lookup for fast access
    const argByIndex = new Map(argDefs.map((a) => [a.index, a]));
    const optionByIndex = new Map(optionDefs.map((o) => [o.index, o]));

    const params: ParamSchema[] = [];

    for (let i = 0; i < paramTypes.length; i++) {
      const reflectedType = paramTypes[i];

      if (optionByIndex.has(i)) {
        const optDef = optionByIndex.get(i)!;
        const resolvedType = reflectedType ? (PARAM_TYPE_MAP.get(reflectedType) ?? "string") : "string";
        params.push({
          index: i,
          kind: "option",
          resolvedType,
          name: optDef.name,
          required: optDef.required,
        });
        continue;
      }

      if (argByIndex.has(i)) {
        const argDef = argByIndex.get(i)!;
        const resolvedType = reflectedType ? (PARAM_TYPE_MAP.get(reflectedType) ?? "string") : "string";
        params.push({
          index: i,
          kind: "arg",
          resolvedType,
          required: argDef.required,
          fetch: argDef.fetch,
        });
        continue;
      }

      // No decorator — treat as ctx (should be the last parameter)
      params.push({
        index: i,
        kind: "ctx",
        resolvedType: "ctx",
      });
    }

    return params;
  }

  private getCategoryFromPath(filePath: string, baseDir: string): string | undefined {
    const relative = path.relative(baseDir, filePath);
    const parts = relative.split(path.sep);
    return parts.length > 1 ? parts[0] : undefined;
  }
}
