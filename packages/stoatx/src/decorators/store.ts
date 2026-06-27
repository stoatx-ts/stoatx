import type { RegisteredCommand } from "../registry";

/**
 * Global store for all decorated classes and commands
 * This allows automatic registration without directory scanning
 */
export class DecoratorStore {
  private static instance: DecoratorStore;

  /** Stoat classes with their SimpleCommand methods */
  private stoatClasses: Set<Function> = new Set();

  /** Registered commands from @Stoat/@SimpleCommand decorators */
  private commands: RegisteredCommand[] = [];

  /** Whether the store has been initialized */
  private initialized = false;

  private constructor() {}

  static getInstance(): DecoratorStore {
    if (!DecoratorStore.instance) {
      DecoratorStore.instance = new DecoratorStore();
    }
    return DecoratorStore.instance;
  }

  /**
   * Register a @Stoat decorated class
   */
  registerStoatClass(classConstructor: Function): void {
    this.stoatClasses.add(classConstructor);
  }

  /**
   * Get all registered Stoat classes with their instances
   */
  getStoatClasses(): Set<Function> {
    return this.stoatClasses;
  }

  /**
   * Add a registered command
   */
  addCommand(command: RegisteredCommand): void {
    this.commands.push(command);
  }

  /**
   * Get all registered commands
   */
  getCommands(): RegisteredCommand[] {
    return this.commands;
  }

  /**
   * Clear all registered classes (useful for testing)
   */
  clear(): void {
    this.stoatClasses.clear();
    this.commands = [];
    this.initialized = false;
  }

  /**
   * Mark as initialized
   */
  markInitialized(): void {
    this.initialized = true;
  }

  /**
   * Check if initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

export const decoratorStore = DecoratorStore.getInstance();
