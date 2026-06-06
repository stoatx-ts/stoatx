import type { RESTManager } from "../rest/RESTManager";

export type CDNTag = "attachments" | "avatars" | "backgrounds" | "icons" | "banners" | "emojis";

export class AttachmentBuilder {
  // Filename for CDN to use, optional but recommended
  public readonly filename: string | undefined = undefined;
  public readonly file: Buffer | Blob;

  /**
   * Creates a new AttachmentBuilder with the given file and optional filename.
   * @param file The file data as a Buffer or Blob.
   * @param filename An optional filename to use for the uploaded file. If not provided, the CDN will assign a default name.
   *                 Providing a filename can help with organization and debugging, but is not strictly required.
   * @example
   * // Create an attachment from a Buffer with a custom filename
   * const buffer = Buffer.from("Hello, world!");
   * const attachment = new AttachmentBuilder(buffer, "greeting.txt");
   */
  constructor(file: Buffer | Blob, filename?: string) {
    this.filename = filename;
    this.file = file;
  }

  /**
   * Uploads this attachment to the Stoat CDN and returns the resulting file ID.
   * @internal — use `resolveAttachment()` instead of calling this directly.
   */
  public async upload(rest: RESTManager, tag: CDNTag): Promise<string> {
    return rest.uploadFile(tag, this.file, this.filename);
  }
}
