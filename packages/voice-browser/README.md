# @stoatx/voice-browser

Voice for [`@stoatx/client`](https://www.npmjs.com/package/@stoatx/client) in browsers: join voice channels with the user's microphone and hear everyone else.

```bash
npm install @stoatx/voice-browser
```

```ts
import { VoiceManager } from "@stoatx/voice-browser";

const voice = new VoiceManager(client);
const connection = await voice.join(channel);

// From a click handler: asks for microphone permission the first time.
await connection.setMicrophoneEnabled(true);
```

For Node.js, use [`@stoatx/voice-node`](https://www.npmjs.com/package/@stoatx/voice-node). Guides and API reference: **[Stoatx Documentation](https://stoatx-ts.github.io/stoatx/)**.

## License

MIT © [Stoatx / Stoatx Team]
