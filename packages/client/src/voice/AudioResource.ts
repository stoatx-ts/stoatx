import { Readable } from "node:stream";
import { spawn } from "node:child_process";
import { PassThrough } from "node:stream";
import { existsSync } from "node:fs";

export interface AudioResourceOptions {
  volume?: number;
  inputType?: string;
}

export type AudioSource = string | Readable;

export class AudioResource {
  readonly stream: Readable;

  private constructor(stream: Readable) {
    this.stream = stream;
  }

  static from(source: AudioSource, options: AudioResourceOptions = {}): AudioResource {
    if (typeof source === "string" && !source.startsWith("http") && !existsSync(source)) {
      throw new Error(`Audio file not found: ${source}`);
    }
    const { volume = 1.0, inputType } = options;

    const args = [
      ...(inputType ? ["-f", inputType] : []),
      "-i",
      typeof source === "string" ? source : "pipe:0",
      "-af",
      `volume=${volume}`,
      "-ar",
      "48000",
      "-ac",
      "2",
      "-f",
      "s16le",
      "-acodec",
      "pcm_s16le",
      "pipe:1",
    ];

    const ffmpeg = spawn("ffmpeg", args, { stdio: ["pipe", "pipe", "ignore"] });

    if (source instanceof Readable) {
      source.pipe(ffmpeg.stdin!);
      source.once("error", () => ffmpeg.kill());
    }

    ffmpeg.stdin?.on("error", () => {}); // suppress EPIPE on early kill

    const pass = new PassThrough();
    ffmpeg.stdout.pipe(pass);
    ffmpeg.once("error", (err) => pass.destroy(err));
    ffmpeg.once("close", (code) => {
      if (code !== 0 && code !== null) {
        pass.destroy(new Error(`ffmpeg exited with code ${code}`));
      }
    });

    return new AudioResource(pass);
  }
}
