# Abstract Class: BaseChannel

The base class for all structures.

## Extends

- [`Base`](Base.md)

## Extended by

- [`DMChannel`](DMChannel.md)
- [`TextChannel`](TextChannel.md)
- [`UnknownChannel`](UnknownChannel.md)
- [`GroupChannel`](GroupChannel.md)

## Constructors

### Constructor

> `protected` **new BaseChannel**(`client`, `data`): `BaseChannel`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `data` | \{ \} \| \{ \} \| \{ \} \| \{ \} |

#### Returns

`BaseChannel`

#### Overrides

[`Base`](Base.md).[`constructor`](Base.md#constructor)

## Properties

### cachedAt

> **cachedAt**: `number`

#### Inherited from

[`Base`](Base.md).[`cachedAt`](Base.md#cachedat)

***

### client

> `protected` `readonly` **client**: [`Client`](Client.md)

#### Inherited from

[`Base`](Base.md).[`client`](Base.md#client)

***

### id

> `readonly` **id**: `string`

#### Inherited from

[`Base`](Base.md).[`id`](Base.md#id)

***

### messages

> **messages**: [`MessageManager`](MessageManager.md)

***

### type

> **type**: [`ChannelType`](../type-aliases/ChannelType.md)

***

### typingUserIds

> `readonly` **typingUserIds**: `Set`\<`string`\>

IDs of the users currently typing in this channel, kept up to date from gateway events.
Cleared when a user sends a message or stops typing, and on reconnect.

***

### webhooks

> **webhooks**: `WebhookManager`

## Accessors

### mentionCount

#### Get Signature

> **get** **mentionCount**(): `number`

How many unread messages in this channel mention the logged-in user. Always `0` for bots.

##### Returns

`number`

***

### unread

#### Get Signature

> **get** **unread**(): `boolean`

Whether this channel has messages the logged-in user hasn't read. Always `false` for bots.

##### Returns

`boolean`

## Methods

### \_clone()

> **\_clone**(): `this`

Creates a snapshot of this structure. Plain nested data (objects and arrays)
is copied so later patches to the original do not leak into the snapshot;
class instances (client, managers, other structures) are shared by reference.

#### Returns

`this`

#### Inherited from

[`Base`](Base.md).[`_clone`](Base.md#_clone)

***

### ack()

> **ack**(`message?`): `Promise`\<`void`\>

Marks this channel as read (user sessions only).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `message?` | [`MessageResolvable`](../type-aliases/MessageResolvable.md) | The last message read. Defaults to the latest message in the channel. |

#### Returns

`Promise`\<`void`\>

***

### awaitMessages()

> **awaitMessages**(`options?`): `Promise`\<[`Collection`](Collection.md)\<`string`, [`Message`](Message.md)\>\>

Awaits messages in this channel that meet certain criteria.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`MessageCollectorOptions`](../interfaces/MessageCollectorOptions.md) | The options for the collector. |

#### Returns

`Promise`\<[`Collection`](Collection.md)\<`string`, [`Message`](Message.md)\>\>

A promise that resolves to a collection of messages.

#### Example

```ts
// Await !vote messages
const filter = m => m.content.startsWith('!vote');
channel.awaitMessages({ filter, max: 4, time: 60000 })
  .then(collected => console.log(collected.size))
  .catch(console.error);
```

***

### bulkDelete()

> **bulkDelete**(`messages`): `Promise`\<`void`\>

Bulk delete messages from this channel

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `messages` | [`MessageResolvable`](../type-aliases/MessageResolvable.md)[] | MessageResolvable to delete |

#### Returns

`Promise`\<`void`\>

#### Throws

If the API request fails

#### Example

```ts
// Delete messages by their ID's
await channel.bulkDelete(["MESSAGE_ID_1", "MESSAGE_ID_2", "MESSAGE_ID_3"]);
// Delete messages by their Message objects
await channel.bulkDelete([message1, message2, message3]);
```

***

### createMessageCollector()

> **createMessageCollector**(`options?`): [`MessageCollector`](MessageCollector.md)

Creates a MessageCollector to collect messages in this channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | [`MessageCollectorOptions`](../interfaces/MessageCollectorOptions.md) | The options for the collector. |

#### Returns

[`MessageCollector`](MessageCollector.md)

The instantiated MessageCollector

#### Example

```ts
const collector = channel.createMessageCollector({ filter: m => m.authorId === '123', time: 15000 });
collector.on('collect', m => console.log(`Collected ${m.content}`));
collector.on('end', collected => console.log(`Collected ${collected.size} items`));
```

***

### delete()

> **delete**(): `Promise`\<`void`\>

Deletes this channel.

#### Returns

`Promise`\<`void`\>

#### Throws

If the API request fails

#### Example

```ts
// Delete the channel
await channel.delete();
```

***

### edit()

> **edit**(`options`): `Promise`\<`BaseChannel`\>

Edits this channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`ChannelEditOptions`](../interfaces/ChannelEditOptions.md) | The fields to update |

#### Returns

`Promise`\<`BaseChannel`\>

BaseChannel

#### Throws

If the API request fails

#### Example

```ts
// Edit the channel's name
await channel.edit({name: "New Cool Name"});
```

***

### equals()

> **equals**(`other`): `boolean`

Compares this object with another to see if they represent the same entity.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | `string` \| [`Base`](Base.md) |

#### Returns

`boolean`

#### Inherited from

[`Base`](Base.md).[`equals`](Base.md#equals)

***

### fetch()

> **fetch**(`force?`): `Promise`\<`BaseChannel`\>

Fetch this channel

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `force` | `boolean` | `false` | Whether to skip the cache check and force a direct API request. Defaults to false |

#### Returns

`Promise`\<`BaseChannel`\>

#### Throws

If the API request fails

#### Example

```ts
// Force fetch channel to update its data
await channel.fetch(true);
```

***

### fetchMessages()

> **fetchMessages**(`options?`): `Promise`\<[`Collection`](Collection.md)\<`string`, [`Message`](Message.md)\>\>

Fetches multiple messages from this channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | [`MessageFetchOptions`](../interfaces/MessageFetchOptions.md) | The query parameters to filter the messages. |

#### Returns

`Promise`\<[`Collection`](Collection.md)\<`string`, [`Message`](Message.md)\>\>

A Collection of Messages, keyed by their ID.

#### Throws

If the API request fails

#### Example

```ts
// Fetch the last 50 messages in the channel
const messages = await channel.fetchMessages({ limit: 50 });
console.log(`Fetched ${messages.size} messages`);
// Fetch messages before a specific message ID
const messages = await channel.fetchMessages({ before: "MESSAGE_ID" });
console.log(`Fetched ${messages.size} messages sent before the specified message`);
// Fetch messages after a specific message ID
const messages = await channel.fetchMessages({ after: "MESSAGE_ID" });
console.log(`Fetched ${messages.size} messages sent after the specified message`);
// Fetch messages around a specific message ID
const messages = await channel.fetchMessages({ nearby: "MESSAGE_ID", limit: 10 });
console.log(`Fetched ${messages.size} messages sent around the specified message`);
```

***

### isDM()

> **isDM**(): `this is DMChannel`

#### Returns

`this is DMChannel`

***

### isGroup()

> **isGroup**(): `this is GroupChannel`

#### Returns

`this is GroupChannel`

***

### isText()

> **isText**(): `this is TextChannel`

#### Returns

`this is TextChannel`

***

### isVoice()

> **isVoice**(): `this is VoiceChannel`

#### Returns

`this is VoiceChannel`

***

### send()

> **send**(`contentOrOptions`): `Promise`\<[`Message`](Message.md)\>

Sends a message to this channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `contentOrOptions` | `string` \| [`MessageOptions`](../interfaces/MessageOptions.md) | The string content or message options payload. |

#### Returns

`Promise`\<[`Message`](Message.md)\>

A promise that resolves to the sent Message.

#### Example

```ts
await channel.send("Hello world!");
await channel.send({ content: "Here is an embed", embeds: [myEmbed] });
```

***

### startTyping()

> **startTyping**(): `boolean`

Shows the logged-in user as typing in this channel. Safe to call on every keystroke:
it sends at most once every 2.5 seconds, and other clients drop the indicator after
4 seconds without a refresh. Call [stopTyping](#stoptyping) when the user stops, or just send
the message: sending ends the indicator.

#### Returns

`boolean`

`false` if the gateway isn't connected.

***

### stopTyping()

> **stopTyping**(): `boolean`

Stops showing the logged-in user as typing in this channel.

#### Returns

`boolean`

`false` if the gateway isn't connected.

***

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`Base`](Base.md).[`toString`](Base.md#tostring)
