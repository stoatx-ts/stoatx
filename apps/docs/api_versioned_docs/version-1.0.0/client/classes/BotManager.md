# Class: BotManager

Creates and manages the logged-in user's bots (user sessions only). Available as `client.bots`.

## Example

```ts
const bot = await client.bots.create("my-bot");
console.log(bot.token); // log the bot in with this
await bot.inviteToServer(server);
```

## Extends

- [`BaseManager`](BaseManager.md)\<`string`, [`Bot`](Bot.md), `RawBot`\>

## Constructors

### Constructor

> **new BotManager**(`client`): `BotManager`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | The client this manager belongs to. |

#### Returns

`BotManager`

#### Overrides

[`BaseManager`](BaseManager.md).[`constructor`](BaseManager.md#constructor)

## Properties

### cache

> **cache**: [`Collection`](Collection.md)\<`string`, [`Bot`](Bot.md)\>

#### Inherited from

[`BaseManager`](BaseManager.md).[`cache`](BaseManager.md#cache)

***

### client

> **client**: [`Client`](Client.md)

#### Inherited from

[`BaseManager`](BaseManager.md).[`client`](BaseManager.md#client)

## Methods

### create()

> **create**(`name`): `Promise`\<[`Bot`](Bot.md)\>

Creates a bot owned by the logged-in user.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The bot's username, 2–32 characters: letters, numbers, `_`, `.` and `-`. |

#### Returns

`Promise`\<[`Bot`](Bot.md)\>

The new bot, with its token.

#### Throws

`ReachedMaximumBots` if the user has too many bots, or `UsernameTaken`.

***

### delete()

> **delete**(`bot`): `Promise`\<`void`\>

Deletes a bot the logged-in user owns.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bot` | [`BotResolvable`](../type-aliases/BotResolvable.md) | The bot or its ID. |

#### Returns

`Promise`\<`void`\>

***

### edit()

> **edit**(`bot`, `options`): `Promise`\<[`Bot`](Bot.md)\>

Edits a bot the logged-in user owns.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bot` | [`BotResolvable`](../type-aliases/BotResolvable.md) | The bot or its ID. |
| `options` | [`BotEditOptions`](../interfaces/BotEditOptions.md) | The fields to change. |

#### Returns

`Promise`\<[`Bot`](Bot.md)\>

The updated bot.

***

### fetch()

> **fetch**(`bot`): `Promise`\<[`Bot`](Bot.md)\>

Fetches a bot the logged-in user owns.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bot` | [`BotResolvable`](../type-aliases/BotResolvable.md) | The bot or its ID. |

#### Returns

`Promise`\<[`Bot`](Bot.md)\>

The bot, with its token.

***

### fetchOwned()

> **fetchOwned**(): `Promise`\<[`Collection`](Collection.md)\<`string`, [`Bot`](Bot.md)\>\>

Fetches every bot the logged-in user owns.

#### Returns

`Promise`\<[`Collection`](Collection.md)\<`string`, [`Bot`](Bot.md)\>\>

The bots, keyed by ID.

***

### fetchPublic()

> **fetchPublic**(`id`): `Promise`\<[`PublicBot`](../interfaces/PublicBot.md)\>

Fetches a public bot's details, or one the logged-in user owns, e.g. for an invite page.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | The bot's ID. |

#### Returns

`Promise`\<[`PublicBot`](../interfaces/PublicBot.md)\>

What anyone can see about the bot.

#### Throws

`NotFound` if the bot doesn't exist or isn't public.

***

### inviteToGroup()

> **inviteToGroup**(`bot`, `group`): `Promise`\<`void`\>

Adds a bot to a group the logged-in user is in. Works for public bots and the user's own.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bot` | [`BotResolvable`](../type-aliases/BotResolvable.md) | The bot or its ID. |
| `group` | `string` \| [`GroupChannel`](GroupChannel.md) | The group or its ID. |

#### Returns

`Promise`\<`void`\>

***

### inviteToServer()

> **inviteToServer**(`bot`, `server`, `permissions?`): `Promise`\<`void`\>

Adds a bot to a server the logged-in user can manage. Works for public bots and the user's own.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bot` | [`BotResolvable`](../type-aliases/BotResolvable.md) | The bot or its ID. |
| `server` | `string` \| [`Server`](Server.md) | The server or its ID. |
| `permissions?` | [`PermissionResolvable`](../type-aliases/PermissionResolvable.md) | The permissions to give the bot. Defaults to the bot's default permissions. |

#### Returns

`Promise`\<`void`\>

***

### resolveId()

> **resolveId**(`bot`): `string`

Resolves a bot to its ID.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `bot` | [`BotResolvable`](../type-aliases/BotResolvable.md) | The bot or its ID. |

#### Returns

`string`
