# Class: ServerManager

## Extends

- [`BaseManager`](BaseManager.md)\<`string`, [`Server`](Server.md), `RawServer`\>

## Constructors

### Constructor

> **new ServerManager**(`client`, `limit?`): `ServerManager`

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | `undefined` |
| `limit` | `number` | `Infinity` |

#### Returns

`ServerManager`

#### Overrides

[`BaseManager`](BaseManager.md).[`constructor`](BaseManager.md#constructor)

## Properties

### cache

> **cache**: [`Collection`](Collection.md)\<`string`, [`Server`](Server.md)\>

#### Inherited from

[`BaseManager`](BaseManager.md).[`cache`](BaseManager.md#cache)

***

### client

> **client**: [`Client`](Client.md)

#### Inherited from

[`BaseManager`](BaseManager.md).[`client`](BaseManager.md#client)

## Methods

### construct()

> `protected` **construct**(`data`): [`Server`](Server.md)

Tell BaseManager how to build a Server

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |

#### Returns

[`Server`](Server.md)

#### Overrides

`BaseManager.construct`

***

### create()

> **create**(`options`): `Promise`\<[`Server`](Server.md)\>

Creates a server owned by the logged-in user (user sessions only; bots can't create servers).
The server and its default channels are cached by the time this resolves.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`ServerCreateOptions`](../interfaces/ServerCreateOptions.md) | The server's name, and optionally its description and whether it's age-restricted. |

#### Returns

`Promise`\<[`Server`](Server.md)\>

The new server.

#### Throws

`IsBot` for bots, or `TooManyServers` if the user is at the server limit.

#### Example

```ts
const server = await client.servers.create({ name: "My Server" });
```

***

### edit()

> **edit**(`serverId`, `options`): `Promise`\<[`Server`](Server.md)\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `serverId` | `string` |
| `options` | [`ServerEditOptions`](../interfaces/ServerEditOptions.md) |

#### Returns

`Promise`\<[`Server`](Server.md)\>

***

### extractId()

> `protected` **extractId**(`data`): `string`

Tell BaseManager how to find the ID for Servers

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

> **fetch**(`id`, `force?`): `Promise`\<[`Server`](Server.md)\>

Fetches a server from the API.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `id` | `string` | `undefined` | The server ID. |
| `force` | `boolean` | `false` | Whether to skip the cache and fetch from the API. |

#### Returns

`Promise`\<[`Server`](Server.md)\>
