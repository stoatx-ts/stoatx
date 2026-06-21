# Class: DMChannel

The base class for all structures.

## Extends

- [`BaseChannel`](BaseChannel.md)

## Constructors

### Constructor

> **new DMChannel**(`client`, `data`): `DMChannel`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `data` | \{ \} |

#### Returns

`DMChannel`

#### Overrides

[`BaseChannel`](BaseChannel.md).[`constructor`](BaseChannel.md#constructor)

## Properties

### active

> **active**: `boolean` = `false`

***

### cachedAt

> **cachedAt**: `number`

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`cachedAt`](BaseChannel.md#cachedat)

***

### client

> `protected` `readonly` **client**: [`Client`](Client.md)

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`client`](BaseChannel.md#client)

***

### id

> `readonly` **id**: `string`

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`id`](BaseChannel.md#id)

***

### lastMessageId

> **lastMessageId**: `string` \| `null` = `null`

***

### messages

> **messages**: [`MessageManager`](MessageManager.md)

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`messages`](BaseChannel.md#messages)

***

### recipients

> **recipients**: `string`[] = `[]`

***

### type

> **type**: [`ChannelType`](../type-aliases/ChannelType.md)

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`type`](BaseChannel.md#type)

## Methods

### \_clone()

> **\_clone**(): `this`

Helper to quickly clone a structure

#### Returns

`this`

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`_clone`](BaseChannel.md#_clone)

***

### \_patch()

> **\_patch**(`data`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |

#### Returns

`void`

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

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`awaitMessages`](BaseChannel.md#awaitmessages)

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

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`bulkDelete`](BaseChannel.md#bulkdelete)

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

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`createMessageCollector`](BaseChannel.md#createmessagecollector)

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

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`delete`](BaseChannel.md#delete)

***

### edit()

> **edit**(`options`): `Promise`\<[`BaseChannel`](BaseChannel.md)\>

Edits this channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`ChannelEditOptions`](../interfaces/ChannelEditOptions.md) | The fields to update |

#### Returns

`Promise`\<[`BaseChannel`](BaseChannel.md)\>

BaseChannel

#### Throws

If the API request fails

#### Example

```ts
// Edit the channel's name
await channel.edit({name: "New Cool Name"});
```

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`edit`](BaseChannel.md#edit)

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

[`BaseChannel`](BaseChannel.md).[`equals`](BaseChannel.md#equals)

***

### fetch()

> **fetch**(`force?`): `Promise`\<[`BaseChannel`](BaseChannel.md)\>

Fetch this channel

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `force` | `boolean` | `false` | Whether to skip the cache check and force a direct API request. Defaults to false |

#### Returns

`Promise`\<[`BaseChannel`](BaseChannel.md)\>

#### Throws

If the API request fails

#### Example

```ts
// Force fetch channel to update its data
await channel.fetch(true);
```

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`fetch`](BaseChannel.md#fetch)

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
const messages = await channel.fetchMessages({ around: "MESSAGE_ID", limit: 10 });
console.log(`Fetched ${messages.size} messages sent around the specified message`);
```

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`fetchMessages`](BaseChannel.md#fetchmessages)

***

### isDM()

> **isDM**(): `this is DMChannel`

#### Returns

`this is DMChannel`

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`isDM`](BaseChannel.md#isdm)

***

### isGroup()

> **isGroup**(): `this is GroupChannel`

#### Returns

`this is GroupChannel`

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`isGroup`](BaseChannel.md#isgroup)

***

### isText()

> **isText**(): `this is TextChannel`

#### Returns

`this is TextChannel`

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`isText`](BaseChannel.md#istext)

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

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`send`](BaseChannel.md#send)

***

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`toString`](BaseChannel.md#tostring)
