import type { RESTManager } from "../rest/RESTManager";

export type CDNTag = "attachments" | "avatars" | "backgrounds" | "icons" | "banners" | "emojis";

/**
 * Raw file contents accepted for uploads. Node `Buffer`s are `Uint8Array`s, so they work too.
 */
export type AttachmentData = Blob | ArrayBuffer | ArrayBufferView;

export class AttachmentBuilder {
  // Filename for CDN to use, optional but recommended
  public readonly filename: string | undefined = undefined;
  public readonly file: AttachmentData;

  /**
   * Creates a new AttachmentBuilder with the given file and optional filename.
   * @param file The file data as a Blob, ArrayBuffer, typed array or Node Buffer.
   * @param filename An optional filename to use for the uploaded file. If not provided, the CDN will assign a default name.
   *                 Providing a filename can help with organization and debugging, but is not strictly required.
   * @example
   * // Create an attachment from a Buffer with a custom filename
   * const buffer = Buffer.from("Hello, world!");
   * const attachment = new AttachmentBuilder(buffer, "greeting.txt");
   * @example
   * // In a browser, pass a File from an <input type="file"> directly (a File is a Blob)
   * const file = input.files[0];
   * const attachment = new AttachmentBuilder(file, file.name);
   */
  constructor(file: AttachmentData, filename?: string) {
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
