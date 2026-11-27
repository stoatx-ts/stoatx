import { describe, it, expect, beforeEach } from "vitest";
import { monotonicFactory } from "ulid";
import { Client, Attachment } from "../src";

const id = monotonicFactory();
let client: Client;

function file(tag: string, filename = "cat picture.png") {
  return {
    _id: id(),
    tag,
    filename,
    metadata: { type: "Image" as const, width: 800, height: 600 },
    content_type: "image/png",
    size: 1234,
  };
}

beforeEach(() => {
  client = new Client();
});

describe("file URLs", () => {
  it("uses the instance's CDN once it's known, and stoat.chat's before", () => {
    const raw = file("attachments");
    const attachment = new Attachment(client, raw);
    expect(attachment.url).toBe(`https://cdn.stoatusercontent.com/attachments/${raw._id}/cat%20picture.png`);

    client.rest.setCDNURL("https://files.example.org/autumn/");
    expect(client.rest.cdnURL).toBe("https://files.example.org/autumn");
    expect(attachment.url).toBe(`https://files.example.org/autumn/attachments/${raw._id}/cat%20picture.png`);
    expect(attachment.previewURL).toBe(`https://files.example.org/autumn/attachments/${raw._id}`);
  });

  it("shows avatars as previews, and keeps the original on the attachment", () => {
    client.rest.setCDNURL("https://cdn.example");
    const avatar = file("avatars", "me.gif");
    const user = client.users._add({
      _id: id(),
      username: "me",
      discriminator: "0001",
      relationship: "None",
      online: false,
      avatar,
    } as any);

    expect(user.displayAvatarURL).toBe(`https://cdn.example/avatars/${avatar._id}`);
    expect(user.avatar!.url).toBe(`https://cdn.example/avatars/${avatar._id}/me.gif`);
  });

  it("gives a member's server avatar from the same CDN route", () => {
    client.rest.setCDNURL("https://cdn.example");
    const serverId = id();
    const userId = id();
    const server = client.servers._add({ _id: serverId, owner: userId, name: "S", channels: [] } as any);
    const avatar = file("avatars");
    const member = server.members._add({
      _id: { server: serverId, user: userId },
      joined_at: new Date().toISOString(),
      avatar,
    } as any);
    const plain = server.members._add({
      _id: { server: serverId, user: id() },
      joined_at: new Date().toISOString(),
    } as any);

    expect(member.avatarURL).toBe(`https://cdn.example/avatars/${avatar._id}`);
    expect(plain.avatarURL).toBeNull();
  });
});
