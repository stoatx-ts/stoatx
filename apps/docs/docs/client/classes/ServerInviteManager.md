# Class: ServerInviteManager

## Extends

- [`BaseManager`](BaseManager.md)\<`string`, [`ServerInvite`](ServerInvite.md), `RawInvite`\>

## Constructors

### Constructor

> **new ServerInviteManager**(`client`, `server`, `limit?`): `ServerInviteManager`

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | `undefined` |
| `server` | [`Server`](Server.md) | `undefined` |
| `limit` | `number` | `Infinity` |

#### Returns

`ServerInviteManager`

#### Overrides

[`BaseManager`](BaseManager.md).[`constructor`](BaseManager.md#constructor)

## Properties

### cache

> **cache**: [`Collection`](Collection.md)\<`string`, [`ServerInvite`](ServerInvite.md)\>

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

### create()

> **create**(`channel`, `options?`): `Promise`\<[`ServerInvite`](ServerInvite.md)\>

Creates an invite to one of this server's channels, and caches it.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | `string` \| [`BaseChannel`](BaseChannel.md) | The channel or its ID. |
| `options` | [`InviteCreateOptions`](../interfaces/InviteCreateOptions.md) | A use limit and expiry time. |

#### Returns

`Promise`\<[`ServerInvite`](ServerInvite.md)\>

The new invite.

***

### delete()

> **delete**(`invite`): `Promise`\<`void`\>

Deletes one of this server's invites and removes it from the cache.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `invite` | `string` \| [`ServerInvite`](ServerInvite.md) | The invite or its code. |

#### Returns

`Promise`\<`void`\>

***

### fetch()

> **fetch**(): `Promise`\<[`Collection`](Collection.md)\<`string`, [`ServerInvite`](ServerInvite.md)\>\>

Fetches all active invites for this server.

#### Returns

`Promise`\<[`Collection`](Collection.md)\<`string`, [`ServerInvite`](ServerInvite.md)\>\>
