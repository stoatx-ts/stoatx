# Interface: VoiceJoinOptions

Options for BaseVoiceManager.join.

## Properties

### forceDisconnect?

> `optional` **forceDisconnect?**: `boolean`

Disconnect the user's other voice connections first, e.g. a call they're in on another device.
Without it, joining while connected elsewhere fails.

***

### node?

> `optional` **node?**: `string`

The voice node to use, by name from BaseVoiceManager.fetchNodes. Defaults to the server's choice.

***

### recipients?

> `optional` **recipients?**: `UserResolvable`[]

Who to ring when starting a call in a DM or group. Only used when nobody is in the call yet.
Defaults to everyone in the DM or group.
