# Class: MessageReaction

## Constructors

### Constructor

> **new MessageReaction**(`client`, `data`): `MessageReaction`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `data` | \{ `emojiId`: `string`; `message`: [`Message`](Message.md) \| \{ `channelId`: `string`; `id`: `string`; \}; `users?`: `string`[]; \} |
| `data.emojiId` | `string` |
| `data.message` | [`Message`](Message.md) \| \{ `channelId`: `string`; `id`: `string`; \} |
| `data.users?` | `string`[] |

#### Returns

`MessageReaction`

## Properties

### client

> **client**: [`Client`](Client.md)

***

### emoji

> **emoji**: `string` \| [`Emoji`](Emoji.md)

***

### message

> **message**: [`Message`](Message.md) \| \{ `channelId`: `string`; `id`: `string`; \}

***

### users

> **users**: [`Collection`](Collection.md)\<`string`, [`User`](User.md) \| \{ `id`: `string`; \}\>

## Accessors

### count

#### Get Signature

> **get** **count**(): `number`

##### Returns

`number`

## Methods

### \[custom\]()

> **\[custom\]**(): `string`

#### Returns

`string`

***

### remove()

> **remove**(): `Promise`\<`void`\>

#### Returns

`Promise`\<`void`\>
