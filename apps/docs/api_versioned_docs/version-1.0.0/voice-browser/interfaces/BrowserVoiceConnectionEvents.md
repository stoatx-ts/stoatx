# Interface: BrowserVoiceConnectionEvents

Events a browser voice connection emits.

## Extends

- [`VoiceConnectionEvents`](VoiceConnectionEvents.md)

## Properties

### activeSpeakersChange

> **activeSpeakersChange**: \[`string`[]\]

The people currently speaking changed. Includes the logged-in user while they talk.
Each ID is the participant's LiveKit identity, which is their Stoat user ID.

***

### audioPlaybackChange

> **audioPlaybackChange**: \[`boolean`\]

Whether the browser lets the call's audio play changed. When it's `false`, call
[VoiceConnection.startAudio](../classes/VoiceConnection.md#startaudio) from a click or key press.

***

### disconnect

> **disconnect**: \[\]

Left the call, or the connection was lost.

#### Inherited from

[`VoiceConnectionEvents`](VoiceConnectionEvents.md).[`disconnect`](VoiceConnectionEvents.md#disconnect)

***

### error

> **error**: \[`Error`\]

Something went wrong while connected, e.g. sending audio failed.

#### Inherited from

[`VoiceConnectionEvents`](VoiceConnectionEvents.md).[`error`](VoiceConnectionEvents.md#error)

***

### move

> **move**: \[`BaseVoiceConnection`\<[`VoiceConnectionEvents`](VoiceConnectionEvents.md)\>\]

The server moved the user to another call, e.g. a moderator dragged them. This connection
disconnects right after; use the new one from now on. It already plays the same audio
(Node.js) or keeps the microphone and deafen state (browser).

#### Inherited from

[`VoiceConnectionEvents`](VoiceConnectionEvents.md).[`move`](VoiceConnectionEvents.md#move)

***

### participantJoin

> **participantJoin**: \[`string`\]

Someone joined the call.

***

### participantLeave

> **participantLeave**: \[`string`\]

Someone left the call.

***

### ready

> **ready**: \[\]

Connected to the call.

#### Inherited from

[`VoiceConnectionEvents`](VoiceConnectionEvents.md).[`ready`](VoiceConnectionEvents.md#ready)
