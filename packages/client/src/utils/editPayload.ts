import type { RESTManager } from "../rest/RESTManager";
import type { AttachmentBuilder, CDNTag } from "../builders/AttachmentBuilder";
import { resolveAttachment } from "./resolveAttachment";
import { Permissions, type PermissionResolvable } from "./permissions";

/**
 * Applies a nullable option to an edit payload: `undefined` is ignored,
 * `null` queues `field` for removal, anything else is set on `payload[key]`.
 * @internal
 */
export function setOrRemove<P, Key extends keyof P, F>(
  payload: P,
  remove: F[],
  key: Key,
  value: Exclude<P[Key], undefined> | null | undefined,
  field: F,
): void {
  if (value === undefined) return;
  if (value === null) remove.push(field);
  else payload[key] = value;
}

/**
 * Attaches the removal list to the payload.
 * @returns Whether the payload contains anything to send.
 * @internal
 */
export function finalizeEdit<F, P extends { remove?: F[] | null }>(payload: P, remove: F[]): boolean {
  if (remove.length > 0) payload.remove = remove;
  return Object.keys(payload).length > 0;
}

/**
 * Uploads an icon-like attachment if needed and applies it like {@link setOrRemove}.
 * @internal
 */
export async function setOrRemoveAttachment<P, Key extends keyof P, F>(
  rest: RESTManager,
  payload: P,
  remove: F[],
  key: Key,
  value: string | AttachmentBuilder | null | undefined,
  field: F,
  tag: CDNTag,
): Promise<void> {
  if (value === undefined) return;
  if (value === null) {
    remove.push(field);
    return;
  }
  const resolved = await resolveAttachment(rest, value, tag);
  if (resolved) payload[key] = resolved as P[Key];
}

/**
 * Builds the `{ allow, deny }` permission override payload.
 * @internal
 */
export function buildPermissionPayload(options: { allow?: PermissionResolvable; deny?: PermissionResolvable }): {
  allow: number;
  deny: number;
} {
  return {
    allow: Number(options.allow !== undefined ? Permissions.resolve(options.allow) : 0n),
    deny: Number(options.deny !== undefined ? Permissions.resolve(options.deny) : 0n),
  };
}
