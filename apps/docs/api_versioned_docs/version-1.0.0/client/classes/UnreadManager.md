# Class: UnreadManager

Tracks which channels the logged-in user has read, for user sessions.

The state comes from the `ready` payload and is kept up to date from gateway events,
including acks from the user's other devices. For bots everything reads as "no unreads".

Most code uses the getters on channels and servers instead:
`channel.unread`, `channel.mentionCount`, `channel.ack()`, `server.unread`, `server.ack()`.

## Constructors

### Constructor

> **new UnreadManager**(`client`): `UnreadManager`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | The client this manager belongs to. |

#### Returns

`UnreadManager`

## Properties

### cache

> `readonly` **cache**: [`Collection`](Collection.md)\<`string`, [`ChannelReadState`](../interfaces/ChannelReadState.md)\>

Read state per channel ID. Channels the user has never opened have no entry.

## Methods

### ack()

> **ack**(`channel`, `message?`): `Promise`\<`void`\>

Marks a channel as read up to a message. Other devices on the account are notified.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`ChannelResolvable`](../type-aliases/ChannelResolvable.md) | The channel or its ID. |
| `message?` | [`MessageResolvable`](../type-aliases/MessageResolvable.md) | The last message read. Defaults to the channel's latest message. |

#### Returns

`Promise`\<`void`\>

***

### ackServer()

> **ackServer**(`server`): `Promise`\<`void`\>

Marks every channel in a server as read.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `server` | `string` \| [`Server`](Server.md) | The server or its ID. |

#### Returns

`Promise`\<`void`\>

***

### fetch()

> **fetch**(): `Promise`\<[`Collection`](Collection.md)\<`string`, [`ChannelReadState`](../interfaces/ChannelReadState.md)\>\>

Reloads the read state of every channel from the API, replacing the cache.
The client already loads it on connect, so this is only needed to resync.

#### Returns

`Promise`\<[`Collection`](Collection.md)\<`string`, [`ChannelReadState`](../interfaces/ChannelReadState.md)\>\>

The refreshed cache.

***

### isUnread()

> **isUnread**(`channel`): `boolean`

Whether a channel has messages the user hasn't read.
Always `false` for bots and for channels that aren't cached.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`ChannelResolvable`](../type-aliases/ChannelResolvable.md) | The channel or its ID. |

#### Returns

`boolean`

***

### mentionCount()

> **mentionCount**(`channel`): `number`

How many unread messages in a channel mention the user. Always `0` for bots.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`ChannelResolvable`](../type-aliases/ChannelResolvable.md) | The channel or its ID. |

#### Returns

`number`
