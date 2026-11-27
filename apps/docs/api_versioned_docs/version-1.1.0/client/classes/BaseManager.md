# Abstract Class: BaseManager\<K, Holds, RawData\>

## Extended by

- [`ChannelManager`](ChannelManager.md)
- [`MemberManager`](MemberManager.md)
- [`MessageManager`](MessageManager.md)
- [`RoleManager`](RoleManager.md)
- [`ServerManager`](ServerManager.md)
- [`UserManager`](UserManager.md)
- [`EmojiManager`](EmojiManager.md)
- [`BotManager`](BotManager.md)
- [`ServerBanManager`](ServerBanManager.md)
- [`ServerInviteManager`](ServerInviteManager.md)
- [`WebhookManager`](WebhookManager.md)

## Type Parameters

| Type Parameter | Default type | Description |
| ------ | ------ | ------ |
| `K` | - | The type of the cache keys (usually string) |
| `Holds` | - | The type of the Structure this manager holds |
| `RawData` | `unknown` | The raw API/gateway payload shape used to construct/patch `Holds` |

## Constructors

### Constructor

> `protected` **new BaseManager**\<`K`, `Holds`, `RawData`\>(`client`, `limit?`): `BaseManager`\<`K`, `Holds`, `RawData`\>

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | `undefined` |
| `limit` | `number` | `Infinity` |

#### Returns

`BaseManager`\<`K`, `Holds`, `RawData`\>

## Properties

### cache

> **cache**: [`Collection`](Collection.md)\<`K`, `Holds`\>

***

### client

> **client**: [`Client`](Client.md)
