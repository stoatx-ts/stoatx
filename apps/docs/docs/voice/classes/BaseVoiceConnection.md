# Abstract Class: BaseVoiceConnection\<Events\>

A connection to one voice channel. `@stoatx/voice-node` and `@stoatx/voice-browser` provide the
implementations; get one from their `VoiceManager.join()`.

## Extends

- `EventEmitter`\<`Events`\>

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `Events` *extends* [`VoiceConnectionEvents`](../interfaces/VoiceConnectionEvents.md) & `Record`\<keyof `Events`, `any`[]\> | [`VoiceConnectionEvents`](../interfaces/VoiceConnectionEvents.md) |

## Constructors

### Constructor

> **new BaseVoiceConnection**\<`Events`\>(`channelId`, `serverId`): `BaseVoiceConnection`\<`Events`\>

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channelId` | `string` | The voice channel's ID. |
| `serverId` | `string` \| `null` | The ID of the server the channel is in, or `null` for DMs and groups. |

#### Returns

`BaseVoiceConnection`\<`Events`\>

#### Overrides

`EventEmitter<Events>.constructor`

## Properties

### \_status

> `protected` **\_status**: [`VoiceConnectionStatus`](../type-aliases/VoiceConnectionStatus.md) = `"connecting"`

***

### channelId

> `readonly` **channelId**: `string`

The voice channel's ID.

***

### serverId

> `readonly` **serverId**: `string` \| `null`

The ID of the server the channel is in, or `null` for DMs and groups.

## Accessors

### status

#### Get Signature

> **get** **status**(): [`VoiceConnectionStatus`](../type-aliases/VoiceConnectionStatus.md)

Where the connection is in its lifecycle.

##### Returns

[`VoiceConnectionStatus`](../type-aliases/VoiceConnectionStatus.md)

## Methods

### disconnect()

> `abstract` **disconnect**(): `Promise`\<`void`\>

Leaves the call.

#### Returns

`Promise`\<`void`\>

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

***

### reportError()

> `protected` **reportError**(`error`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `error` | `unknown` |

#### Returns

`void`
