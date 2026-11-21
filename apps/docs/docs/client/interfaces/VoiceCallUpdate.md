# Interface: VoiceCallUpdate

A DM or group call starting or ending, from the `voiceCallUpdate` event.

## Properties

### channelId

> **channelId**: `string`

***

### ended

> **ended**: `boolean`

Whether the call is over.

***

### initiatorId

> **initiatorId**: `string`

The user who started the call.

***

### startedAt

> **startedAt**: `Date` \| `null`

When the call started, or `null` if it hasn't.
