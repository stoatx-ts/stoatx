import type { ServerBan as RawServerBan } from "stoat-api";

export class ServerBan {
  public userId: string;
  public reason: string | null;

  constructor(data: RawServerBan) {
    this.userId = data._id?.user
    this.reason = data.reason ?? null;
  }

  public _patch(data: RawServerBan) {
    if (data.reason !== undefined) this.reason = data.reason;
  }
}
