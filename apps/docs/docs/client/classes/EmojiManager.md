# Class: EmojiManager

## Extends

- `BaseManager`\<`string`, [`Emoji`](Emoji.md)\>

## Constructors

### Constructor

> **new EmojiManager**(`client`, `server?`, `limit?`): `EmojiManager`

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | `undefined` |
| `server?` | [`Server`](Server.md) | `undefined` |
| `limit?` | `number` | `Infinity` |

#### Returns

`EmojiManager`

#### Overrides

`BaseManager<string, Emoji>.constructor`

## Properties

### cache

> **cache**: [`Collection`](Collection.md)\<`string`, [`Emoji`](Emoji.md)\>

#### Inherited from

`BaseManager.cache`

***

### client

> **client**: [`Client`](Client.md)

#### Inherited from

`BaseManager.client`

***

### server?

> `optional` **server?**: [`Server`](Server.md)

## Methods

### \[custom\]()

> **\[custom\]**(): [`Collection`](Collection.md)\<`string`, [`Emoji`](Emoji.md)\>

#### Returns

[`Collection`](Collection.md)\<`string`, [`Emoji`](Emoji.md)\>

***

### construct()

> `protected` **construct**(`data`): [`Emoji`](Emoji.md)

Tell BaseManager how to build an Emoji

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `any` |

#### Returns

[`Emoji`](Emoji.md)

#### Overrides

`BaseManager.construct`

***

### extractId()

> `protected` **extractId**(`data`): `string`

Tell BaseManager how to find the ID for Emojis

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `any` |

#### Returns

`string`

#### Overrides

`BaseManager.extractId`

***

### fetch()

> **fetch**(`id`): `Promise`\<[`Emoji`](Emoji.md)\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `id` | `string` |

#### Returns

`Promise`\<[`Emoji`](Emoji.md)\>
