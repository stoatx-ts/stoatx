# Interface: VoiceConnectionEvents

Events every voice connection emits. Platform packages add their own.

## Properties

### disconnect

> **disconnect**: \[\]

Left the call, or the connection was lost.

***

### error

> **error**: \[`Error`\]

Something went wrong while connected, e.g. sending audio failed.

***

### move

> **move**: \[`BaseVoiceConnection`\<`VoiceConnectionEvents`\>\]

The server moved the user to another call, e.g. a moderator dragged them. This connection
disconnects right after; use the new one from now on. It already plays the same audio
(Node.js) or keeps the microphone and deafen state (browser).

***

### ready

> **ready**: \[\]

Connected to the call.
