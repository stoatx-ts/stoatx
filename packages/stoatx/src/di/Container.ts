// src/di/Container.ts
import "reflect-metadata";

export class StoatxContainer {
  private instances = new Map<Function, any>();

  /**
   * Resolves a class instance, injecting any required dependencies.
   */
  resolve<T>(target: any): T {
    if (this.instances.has(target)) {
      return this.instances.get(target);
    }

    const paramTypes: any[] = Reflect.getMetadata("design:paramtypes", target) || [];

    const injections = paramTypes.map((param: any, index: number) => {
      if (!param) {
        throw new Error(
          `[Stoatx DI] Cannot resolve constructor parameter #${index} of ${target.name}: its type was erased at compile time. ` +
            `Type it as a concrete class (not an interface, union or type-only import) and enable "emitDecoratorMetadata".`,
        );
      }
      return this.resolve(param);
    });

    const instance = new target(...injections);

    this.instances.set(target, instance);

    return instance;
  }
}
