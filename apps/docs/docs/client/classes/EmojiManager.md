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
| `data` | \{ \} |

#### Returns

[`Emoji`](Emoji.md)

#### Overrides

`BaseManager.construct`

***

### crate()

> **crate**(`options`): `Promise`\<[`Emoji`](Emoji.md)\>

Create a new emoji

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`EmojiCreateOptions`](../interfaces/EmojiCreateOptions.md) | The options for creating the emoji |

#### Returns

`Promise`\<[`Emoji`](Emoji.md)\>

A promise that resolves to the created [Emoji](Emoji.md) object.

#### Throws

If no server is registered in the EmojiManager or if the emoji attachment cannot be resolved.

#### Example

```ts
const emoji = await client.emojis.create(server, { emoji: "path/to/emoji.png", name: "myEmoji" });
```

***

### delete()

> **delete**(`emoji`): `Promise`\<`void`\>

Delete an emoji

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `emoji` | [`EmojiResolvable`](../type-aliases/EmojiResolvable.md) | The [EmojiResolvable](../type-aliases/EmojiResolvable.md) to delete |

#### Returns

`Promise`\<`void`\>

#### Throws

If no server is registered in the EmojiManager.

#### Example

```ts
await client.emojis.delete(emoji);
```

***

### edit()

> **edit**(`emoji`, `options`): `Promise`\<[`Emoji`](Emoji.md)\>

Edit an emoji

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `emoji` | [`EmojiResolvable`](../type-aliases/EmojiResolvable.md) | The [EmojiResolvable](../type-aliases/EmojiResolvable.md) to edit |
| `options` | [`EmojiEditOptions`](../interfaces/EmojiEditOptions.md) | The options to edit the emoji with |

#### Returns

`Promise`\<[`Emoji`](Emoji.md)\>

A promise that resolves to the edited [Emoji](Emoji.md) object.

#### Throws

If no server is registered in the EmojiManager.

#### Example

```ts
const editedEmoji = await client.emojis.edit(emoji, { name: "newName" });
```

***

### extractId()

> `protected` **extractId**(`data`): `string`

Tell BaseManager how to find the ID for Emojis

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |

#### Returns

`string`

#### Overrides

`BaseManager.extractId`

***

### fetch()

> **fetch**(`emoji`, `force?`): `Promise`\<[`Emoji`](Emoji.md)\>

Fetch an Emoji from the API or resolves it from the local cache.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `emoji` | [`EmojiResolvable`](../type-aliases/EmojiResolvable.md) | `undefined` | The ID, mention, or [Emoji](Emoji.md) object to fetch |
| `force` | `boolean` | `false` | Whether to skip the cache check and force a direct API request. Defaults to false. |

#### Returns

`Promise`\<[`Emoji`](Emoji.md)\>

A promise that resolves to the fetched [Emoji](Emoji.md) object.

#### Throws

If an invalid [EmojiResolvable](../type-aliases/EmojiResolvable.md) is provided.

#### Throws

If the API request fails.

#### Example

```ts
// Fetch a channel, bypassing cache
const channel = await client.channels.fetch("01H...", true);
```

***

### resolve()

> **resolve**(`emoji`): [`Emoji`](Emoji.md) \| `undefined`

Resolves a [EmojiResolvable](../type-aliases/EmojiResolvable.md) to a [Emoji](Emoji.md) object from the cache.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `emoji` | [`EmojiResolvable`](../type-aliases/EmojiResolvable.md) | The [EmojiResolvable](../type-aliases/EmojiResolvable.md) to resolve. |

#### Returns

[`Emoji`](Emoji.md) \| `undefined`

The resolved [Emoji](Emoji.md) object, or undefined if not found.

***

### resolveId()

> **resolveId**(`emoji`): `string`

Extracts ID from a [EmojiResolvable](../type-aliases/EmojiResolvable.md).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `emoji` | [`EmojiResolvable`](../type-aliases/EmojiResolvable.md) | The [EmojiResolvable](../type-aliases/EmojiResolvable.md) to extract the ID from. |

#### Returns

`string`

The extracted [Emoji](Emoji.md) ID.

#### Throws

If an invalid type is provided.
