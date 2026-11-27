# Class: VoiceConnection

A connection to a voice channel's call in Node.js. Plays audio from an [AudioPlayer](AudioPlayer.md).
Get one from `VoiceManager.join()`.

## Extends

- `BaseVoiceConnection`

## Constructors

### Constructor

> **new VoiceConnection**(`channelId`, `serverId`): `VoiceConnection`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channelId` | `string` | The voice channel's ID. |
| `serverId` | `string` \| `null` | The ID of the server the channel is in, or `null` for DMs and groups. |

#### Returns

`VoiceConnection`

#### Overrides

`BaseVoiceConnection.constructor`

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

### player

#### Get Signature

> **get** **player**(): [`AudioPlayer`](AudioPlayer.md) \| `null`

The player this connection plays audio from, if it's subscribed to one.

##### Returns

[`AudioPlayer`](AudioPlayer.md) \| `null`

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

Leaves the call and stops sending audio.

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

### subscribe()

> **subscribe**(`player`): `void`

Plays audio from a player in this call. A connection plays from one player at a time;
a player can play into several connections.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `player` | [`AudioPlayer`](AudioPlayer.md) | The player. |

#### Returns

`void`

***

### unsubscribe()

> **unsubscribe**(): `void`

Stops playing audio from the current player.

#### Returns

`void`
