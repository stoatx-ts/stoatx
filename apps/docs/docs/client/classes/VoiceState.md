# Class: VoiceState

Someone in a voice call: who, where, since when, and what they're sending.
Read them from `channel.voiceStates` or `client.voiceStates`.

## Constructors

### Constructor

> **new VoiceState**(`client`, `channelId`, `data`): `VoiceState`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | The client the state belongs to. |
| `channelId` | `string` | The call's channel ID. |
| `data` | [`RawVoiceState`](../interfaces/RawVoiceState.md) | The raw state. |

#### Returns

`VoiceState`

## Properties

### camera

> **camera**: `boolean`

Whether their camera is on.

***

### channelId

> **channelId**: `string`

The ID of the voice channel, DM or group they're in.

***

### isPublishing

> **isPublishing**: `boolean`

Whether they're sending audio. `false` when their microphone is off.

***

### isReceiving

> **isReceiving**: `boolean`

Whether they're hearing the call. `false` when they've deafened.

***

### joinedAt

> **joinedAt**: `Date`

When they joined the call.

***

### screensharing

> **screensharing**: `boolean`

Whether they're sharing their screen.

***

### userId

> `readonly` **userId**: `string`

The user's ID.

## Accessors

### channel

#### Get Signature

> **get** **channel**(): [`BaseChannel`](BaseChannel.md) \| `undefined`

The call's channel, if cached.

##### Returns

[`BaseChannel`](BaseChannel.md) \| `undefined`

***

### user

#### Get Signature

> **get** **user**(): [`User`](User.md) \| `undefined`

The user, if cached.

##### Returns

[`User`](User.md) \| `undefined`
