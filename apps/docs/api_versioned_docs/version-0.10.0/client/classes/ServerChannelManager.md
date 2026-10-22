# Class: ServerChannelManager

## Constructors

### Constructor

> **new ServerChannelManager**(`client`, `server`): `ServerChannelManager`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `server` | [`Server`](Server.md) |

#### Returns

`ServerChannelManager`

## Properties

### client

> **client**: [`Client`](Client.md)

***

### server

> **server**: [`Server`](Server.md)

## Accessors

### cache

#### Get Signature

> **get** **cache**(): [`Collection`](Collection.md)\<`string`, [`BaseChannel`](BaseChannel.md)\>

##### Returns

[`Collection`](Collection.md)\<`string`, [`BaseChannel`](BaseChannel.md)\>

## Methods

### \[custom\]()

> **\[custom\]**(): [`Collection`](Collection.md)\<`string`, [`BaseChannel`](BaseChannel.md)\>

#### Returns

[`Collection`](Collection.md)\<`string`, [`BaseChannel`](BaseChannel.md)\>

***

### create()

> **create**(`options`): `Promise`\<[`BaseChannel`](BaseChannel.md)\>

Creates a new channel within this server.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`ChannelCreateOptions`](../interfaces/ChannelCreateOptions.md) | The configuration for the new channel. |

#### Returns

`Promise`\<[`BaseChannel`](BaseChannel.md)\>

The newly created Channel object.
