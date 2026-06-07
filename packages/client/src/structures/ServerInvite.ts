import type { Invite as RawInvite } from "stoat-api";

export class ServerInvite {
  public code: string;
  public creatorId: string;
  public channelId: string;

  constructor(data: RawInvite) {
    this.code = data._id;
    this.creatorId = data.creator;
    this.channelId = data.channel;
  }

  public _patch(data: RawInvite) {
    this.creatorId = data.creator ?? this.creatorId;
    this.channelId = data.channel ?? this.channelId;
  }
}
