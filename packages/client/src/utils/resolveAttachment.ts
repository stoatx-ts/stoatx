import type { RESTManager } from "../rest/RESTManager";
import { AttachmentBuilder, CDNTag } from "../builders/AttachmentBuilder";

/**
 * Accepts a raw CDN file ID string or an AttachmentBuilder.
 * If given a builder, uploads the file and returns the resulting ID.
 * If given null/undefined, passes through unchanged.
 */
export async function resolveAttachment(
  rest: RESTManager,
  value: string | AttachmentBuilder | null | undefined,
  tag: CDNTag,
): Promise<string | null | undefined> {
  if (value instanceof AttachmentBuilder) {
    return value.upload(rest, tag);
  }
  return value;
}
