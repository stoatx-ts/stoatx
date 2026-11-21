# @stoatx/voice-node

Voice for [`@stoatx/client`](https://www.npmjs.com/package/@stoatx/client) in Node.js: join voice channels and play audio files or streams. Needs `ffmpeg` on your `PATH`.

```bash
npm install @stoatx/voice-node
```

```ts
import { VoiceManager, AudioPlayer, AudioResource } from "@stoatx/voice-node";

const voice = new VoiceManager(client);
const connection = await voice.join(channel);

const player = new AudioPlayer();
connection.subscribe(player);
player.play(AudioResource.from("./song.mp3"));
```

For browsers, use [`@stoatx/voice-browser`](https://www.npmjs.com/package/@stoatx/voice-browser). Guides and API reference: **[Stoatx Documentation](https://stoatx-ts.github.io/stoatx/)**.

## License

MIT © [Stoatx / Stoatx Team]
