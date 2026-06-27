# Class: ServerManager

## Extends

- `BaseManager`\<`string`, [`Server`](Server.md)\>

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

`BaseManager<string, Server>.constructor`

## Properties

### cache

> **cache**: [`Collection`](Collection.md)\<`string`, [`Server`](Server.md)\>

#### Inherited from

`BaseManager.cache`

***

### client

> **client**: [`Client`](Client.md)

#### Inherited from

`BaseManager.client`

## Methods

### \[custom\]()

> **\[custom\]**(): [`Collection`](Collection.md)\<`string`, [`Server`](Server.md)\>

#### Returns

[`Collection`](Collection.md)\<`string`, [`Server`](Server.md)\>

***

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
