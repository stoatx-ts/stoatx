# Class: ServerBanManager

## Extends

- [`BaseManager`](BaseManager.md)\<`string`, [`ServerBan`](ServerBan.md), `RawServerBan`\>

## Constructors

### Constructor

> **new ServerBanManager**(`client`, `server`, `limit?`): `ServerBanManager`

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | `undefined` |
| `server` | [`Server`](Server.md) | `undefined` |
| `limit` | `number` | `Infinity` |

#### Returns

`ServerBanManager`

#### Overrides

[`BaseManager`](BaseManager.md).[`constructor`](BaseManager.md#constructor)

## Properties

### cache

> **cache**: [`Collection`](Collection.md)\<`string`, [`ServerBan`](ServerBan.md)\>

#### Inherited from

[`BaseManager`](BaseManager.md).[`cache`](BaseManager.md#cache)

***

### client

> **client**: [`Client`](Client.md)

#### Inherited from

[`BaseManager`](BaseManager.md).[`client`](BaseManager.md#client)

***

### server

> **server**: [`Server`](Server.md)

## Methods

### fetch()

> **fetch**(): `Promise`\<[`Collection`](Collection.md)\<`string`, [`ServerBan`](ServerBan.md)\>\>

Fetches all bans in this server.
Automatically caches the associated User objects globally!

#### Returns

`Promise`\<[`Collection`](Collection.md)\<`string`, [`ServerBan`](ServerBan.md)\>\>

A promise that resolves to a Collection of Bans.

***

### remove()

> **remove**(`userId`): `Promise`\<`void`\>

Unbans a user from the server.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `userId` | `string` | The ID of the user to unban. |

#### Returns

`Promise`\<`void`\>
