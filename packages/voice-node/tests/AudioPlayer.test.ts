import { describe, it, expect, vi } from "vitest";
import { PassThrough } from "node:stream";
import { AudioPlayer } from "../src/AudioPlayer";
import { AudioResource } from "../src/AudioResource";

function fakeResource() {
  const stream = new PassThrough();
  const proc = { exitCode: null, signalCode: null, stdin: null, kill: vi.fn() };
  const resource = new (AudioResource as any)(stream, proc, null) as AudioResource;
  return { resource, stream, proc };
}

function fakeConnection() {
  const received: Buffer[] = [];
  return {
    received,
    _resetStream: vi.fn(),
    _writeChunk: vi.fn(async (chunk: Buffer) => {
      received.push(chunk);
    }),
  };
}

describe("AudioPlayer", () => {
  it("delivers every chunk to every subscriber", async () => {
    const player = new AudioPlayer();
    const a = fakeConnection();
    const b = fakeConnection();
    player.addSubscriber(a as any);
    player.addSubscriber(b as any);

    const { resource, stream } = fakeResource();
    const idle = new Promise((resolve) => player.once("idle", () => resolve(undefined)));
    player.play(resource);

    stream.write(Buffer.from([1]));
    stream.write(Buffer.from([2]));
    stream.end(Buffer.from([3]));
    await idle;

    expect(Buffer.concat(a.received)).toEqual(Buffer.from([1, 2, 3]));
    expect(Buffer.concat(b.received)).toEqual(Buffer.from([1, 2, 3]));
  });

  it("kills the previous ffmpeg process when a new resource is played", () => {
    const player = new AudioPlayer();
    const first = fakeResource();
    const second = fakeResource();

    player.play(first.resource);
    player.play(second.resource);

    expect(first.proc.kill).toHaveBeenCalledTimes(1);
    expect(first.stream.destroyed).toBe(true);
    expect(second.proc.kill).not.toHaveBeenCalled();
  });

  it("kills ffmpeg on stop", () => {
    const player = new AudioPlayer();
    const { resource, proc } = fakeResource();

    player.play(resource);
    player.stop();

    expect(proc.kill).toHaveBeenCalledTimes(1);
    expect(player.status).toBe("idle");
  });
});
