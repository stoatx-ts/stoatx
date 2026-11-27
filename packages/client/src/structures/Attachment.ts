import { Base } from "./Base";
import type { Client } from "../client/Client";
import { File } from "stoat-api";
import { StoatCDN } from "../utils/Constants";

export type AttachmentMetadata =
  | { type: "File" }
  | { type: "Text" }
  | { type: "Audio" }
  | { type: "Image"; width: number; height: number; thumbhash?: number[] | null; animated?: boolean | null }
  | { type: "Video"; width: number; height: number };

export class Attachment extends Base {
  public override id: string;
  public tag: string;
  public filename: string;
  public metadata: AttachmentMetadata;
  public contentType: string;
  public size: number;

  public deleted?: boolean;
  public reported?: boolean;
  public messageId?: string | null | undefined;
  public userId?: string | null | undefined;
  public serverId?: string | null | undefined;
  public objectId?: string | null | undefined;

  constructor(client: Client, data: File) {
    super(client, { ...data, _id: data._id });

    this.id = data._id;
    this.tag = data.tag;
    this.filename = data.filename;
    this.metadata = data.metadata ?? { type: "File" };
    this.contentType = data.content_type;
    this.size = data.size;

    this.deleted = data.deleted ?? false;
    this.reported = data.reported ?? false;
    this.messageId = data.message_id;
    this.userId = data.user_id;
    this.serverId = data.server_id;
    this.objectId = data.object_id;
  }

  /** The CDN the file is on: the instance's, once logged in, otherwise stoat.chat's. */
  private get cdn(): string {
    return this.client.rest.cdnURL || StoatCDN;
  }

  /**
   * The URL of the original file, at full size. Use it to download or open the file;
   * use {@link previewURL} to show an image.
   */
  public get url(): string {
    return `${this.cdn}/${this.tag}/${this.id}/${encodeURIComponent(this.filename)}`;
  }

  /**
   * The URL of a smaller version of an image, made by the CDN: a WebP that fits within a size
   * set per tag (1280×1280 for attachments, 128×128 for avatars and icons by default).
   * For files that aren't images, and animated images outside avatars and icons, the CDN
   * redirects to the original file. Avatar and icon previews aren't animated.
   */
  public get previewURL(): string {
    return `${this.cdn}/${this.tag}/${this.id}`;
  }

  /**
   * Helper boolean to quickly check if it's an image
   */
  public get isImage(): boolean {
    return this.metadata.type === "Image";
  }
}
