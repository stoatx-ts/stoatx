# Class: VoiceConnection

## Extends

- `EventEmitter`\<[`VoiceConnectionEvents`](../interfaces/VoiceConnectionEvents.md)\>

## Constructors

### Constructor

> **new VoiceConnection**(`channelId`, `guildId?`): `VoiceConnection`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `channelId` | `string` |
| `guildId?` | `string` |

#### Returns

`VoiceConnection`

#### Overrides

`EventEmitter<VoiceConnectionEvents>.constructor`

## Properties

### channelId

> `readonly` **channelId**: `string`

***

### guildId

> `readonly` **guildId**: `string` \| `undefined`

## Accessors

### player

#### Get Signature

> **get** **player**(): [`AudioPlayer`](AudioPlayer.md) \| `null`

##### Returns

[`AudioPlayer`](AudioPlayer.md) \| `null`

***

### status

#### Get Signature

> **get** **status**(): [`VoiceConnectionStatus`](../type-aliases/VoiceConnectionStatus.md)

##### Returns

[`VoiceConnectionStatus`](../type-aliases/VoiceConnectionStatus.md)

## Methods

### \_feedStream()

> **\_feedStream**(`stream`): `Promise`\<`void`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `stream` | `Readable` |

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>

***

### subscribe()

> **subscribe**(`player`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `player` | [`AudioPlayer`](AudioPlayer.md) |

#### Returns

`void`

***

### unsubscribe()

> **unsubscribe**(): `void`

#### Returns

`void`
