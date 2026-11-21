# Interface: VoiceConnectionEvents

Events every voice connection emits. Platform packages add their own.

## Extended by

- [`BrowserVoiceConnectionEvents`](BrowserVoiceConnectionEvents.md)

## Properties

### disconnect

> **disconnect**: \[\]

Left the call, or the connection was lost.

***

### error

> **error**: \[`Error`\]

Something went wrong while connected, e.g. sending audio failed.

***

### ready

> **ready**: \[\]

Connected to the call.
