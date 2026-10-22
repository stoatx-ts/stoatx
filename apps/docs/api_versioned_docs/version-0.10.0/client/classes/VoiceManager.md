# Class: VoiceManager

## Constructors

### Constructor

> **new VoiceManager**(`client`): `VoiceManager`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |

#### Returns

`VoiceManager`

## Methods

### get()

> **get**(`channelId`): [`VoiceConnection`](VoiceConnection.md) \| `undefined`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `channelId` | `string` |

#### Returns

[`VoiceConnection`](VoiceConnection.md) \| `undefined`

***

### join()

> **join**(`channelId`, `guildId?`): `Promise`\<[`VoiceConnection`](VoiceConnection.md)\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `channelId` | `string` |
| `guildId?` | `string` |

#### Returns

`Promise`\<[`VoiceConnection`](VoiceConnection.md)\>

***

### leave()

> **leave**(`channelId`): `Promise`\<`void`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `channelId` | `string` |

#### Returns

`Promise`\<`void`\>

***

### leaveAll()

> **leaveAll**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
