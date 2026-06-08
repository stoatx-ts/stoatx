import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventEmitter } from "events";
import { createChannel } from "../src/utils/ChannelFactory";
import type { Channel as RawChannel } from "stoat-api";

vi.mock("../src/structures/TextChannel", () => ({
  TextChannel: class MockTextChannel {
    constructor(
      public client: any,
      public data: any,
    ) {}
  },
}));

vi.mock("../src/structures/DMChannel", () => ({
  DMChannel: class MockDMChannel {
    constructor(
      public client: any,
      public data: any,
    ) {}
  },
}));

vi.mock("../src/structures/GroupChannel", () => ({
  GroupChannel: class MockGroupChannel {
    constructor(
      public client: any,
      public data: any,
    ) {}
  },
}));

vi.mock("../src/structures/UnknownChannel", () => ({
  UnknownChannel: class MockUnknownChannel {
    constructor(
      public client: any,
      public data: any,
    ) {}
  },
}));

import { TextChannel, DMChannel, GroupChannel, UnknownChannel } from "../src";

class MockClient extends EventEmitter {}

describe("createChannel Factory", () => {
  let mockClient: MockClient;

  beforeEach(() => {
    mockClient = new MockClient();
    vi.spyOn(mockClient, "emit");
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should create and return a TextChannel when channel_type is 'TextChannel'", () => {
    const rawData = { channel_type: "TextChannel", id: "1" } as unknown as RawChannel;

    const channel = createChannel(mockClient as any, rawData);

    expect(channel).toBeInstanceOf(TextChannel);
    expect((channel as any).client).toBe(mockClient);
    expect((channel as any).data).toBe(rawData);
    expect(mockClient.emit).not.toHaveBeenCalled();
  });

  it("should create and return a DMChannel when channel_type is 'DirectMessage'", () => {
    const rawData = { channel_type: "DirectMessage", id: "2" } as unknown as RawChannel;

    const channel = createChannel(mockClient as any, rawData);

    expect(channel).toBeInstanceOf(DMChannel);
    expect(mockClient.emit).not.toHaveBeenCalled();
  });

  it("should create and return a GroupChannel when channel_type is 'Group'", () => {
    const rawData = { channel_type: "Group", id: "3" } as unknown as RawChannel;

    const channel = createChannel(mockClient as any, rawData);

    expect(channel).toBeInstanceOf(GroupChannel);
    expect(mockClient.emit).not.toHaveBeenCalled();
  });

  it("should return UnknownChannel and emit a debug event for unrecognized channel types", () => {
    const rawData = { channel_type: "VoiceChannel", id: "4" } as unknown as RawChannel;

    const channel = createChannel(mockClient as any, rawData);

    expect(channel).toBeInstanceOf(UnknownChannel);

    expect(mockClient.emit).toHaveBeenCalledTimes(1);
    expect(mockClient.emit).toHaveBeenCalledWith("debug", "Received unknown channel type: VoiceChannel");
  });
});
