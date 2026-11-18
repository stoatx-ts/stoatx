/**
 * Every class decorated with `@Stoat()`, in registration order.
 * The registry scans this set after importing each discovered module.
 * @internal
 */
export const stoatClasses = new Set<Function>();
