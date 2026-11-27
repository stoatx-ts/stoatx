# Class: VoiceConnection

A connection to a voice channel's call in the browser. Sends the user's microphone and plays
everyone else. Get one from `VoiceManager.join()`.

The microphone starts off, so joining never triggers a permission prompt by itself:
call [setMicrophoneEnabled](#setmicrophoneenabled) when the user unmutes.

## Extends

- `BaseVoiceConnection`\<[`BrowserVoiceConnectionEvents`](../interfaces/BrowserVoiceConnectionEvents.md)\>

## Constructors

### Constructor

> **new VoiceConnection**(`channelId`, `serverId`, `options?`): `VoiceConnection`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channelId` | `string` | The voice channel's ID. |
| `serverId` | `string` \| `null` | The ID of the server the channel is in, or `null` for DMs and groups. |
| `options` | [`BrowserVoiceOptions`](../interfaces/BrowserVoiceOptions.md) | Where to put the audio elements. |

#### Returns

`VoiceConnection`

#### Overrides

`BaseVoiceConnection<BrowserVoiceConnectionEvents>.constructor`

## Properties

### \_status

> `protected` **\_status**: [`VoiceConnectionStatus`](../type-aliases/VoiceConnectionStatus.md)

#### Inherited from

`BaseVoiceConnection._status`

***

### channelId

> `readonly` **channelId**: `string`

The voice channel's ID.

#### Inherited from

`BaseVoiceConnection.channelId`

***

### serverId

> `readonly` **serverId**: `string` \| `null`

The ID of the server the channel is in, or `null` for DMs and groups.

#### Inherited from

`BaseVoiceConnection.serverId`

## Accessors

### canPlayAudio

#### Get Signature

> **get** **canPlayAudio**(): `boolean`

Whether the browser lets the call's audio play. Browsers block audio until the user interacts
with the page; if this is `false`, call [startAudio](#startaudio) from a click or key press.

##### Returns

`boolean`

***

### deafened

#### Get Signature

> **get** **deafened**(): `boolean`

Whether other people's audio is muted locally.

##### Returns

`boolean`

***

### microphoneEnabled

#### Get Signature

> **get** **microphoneEnabled**(): `boolean`

Whether the user's microphone is being sent to the call.

##### Returns

`boolean`

***

### participantIds

#### Get Signature

> **get** **participantIds**(): `string`[]

The user IDs of everyone else in the call.

##### Returns

`string`[]

***

### status

#### Get Signature

> **get** **status**(): [`VoiceConnectionStatus`](../type-aliases/VoiceConnectionStatus.md)

Where the connection is in its lifecycle.

##### Returns

[`VoiceConnectionStatus`](../type-aliases/VoiceConnectionStatus.md)

#### Inherited from

`BaseVoiceConnection.status`

## Methods

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

Leaves the call, turns the microphone off and removes the audio elements.

#### Returns

`Promise`\<`void`\>

#### Overrides

`BaseVoiceConnection.disconnect`

***

### emitBase()

> `protected` **emitBase**\<`E`\>(`event`, ...`args`): `void`

Emits a base connection event. Subclasses call this instead of `emit()`, whose types can't
be checked against the generic `Events`.

#### Type Parameters

| Type Parameter |
| ------ |
| `E` *extends* keyof [`VoiceConnectionEvents`](../interfaces/VoiceConnectionEvents.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `E` | The event name. |
| ...`args` | [`VoiceConnectionEvents`](../interfaces/VoiceConnectionEvents.md)\[`E`\] | The event's arguments. |

#### Returns

`void`

#### Inherited from

`BaseVoiceConnection.emitBase`

***

### reportError()

> `protected` **reportError**(`error`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | `unknown` |

#### Returns

`void`

#### Inherited from

`BaseVoiceConnection.reportError`

***

### setDeafened()

> **setDeafened**(`deafened`): `void`

Mutes or unmutes everyone else locally. The microphone isn't affected; turn it off too to
fully deafen, like the official client does.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `deafened` | `boolean` | Whether to mute other people. |

#### Returns

`void`

***

### setMicrophoneEnabled()

> **setMicrophoneEnabled**(`enabled`, `deviceId?`): `Promise`\<`void`\>

Turns the microphone on or off. Turning it on the first time asks the user for permission.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `enabled` | `boolean` | Whether to send the microphone. |
| `deviceId?` | `string` | The microphone to use, from `navigator.mediaDevices.enumerateDevices()`. Defaults to the browser's default microphone. |

#### Returns

`Promise`\<`void`\>

#### Throws

If the user denies microphone access.

#### Example

```ts
muteButton.onclick = () => connection.setMicrophoneEnabled(!connection.microphoneEnabled);
```

***

### startAudio()

> **startAudio**(): `Promise`\<`void`\>

Starts the call's audio after the browser blocked it. Must be called from a user interaction,
like a click handler.

#### Returns

`Promise`\<`void`\>
