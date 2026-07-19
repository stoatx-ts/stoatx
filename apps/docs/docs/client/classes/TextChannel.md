# Class: TextChannel

The base class for all structures.

## Extends

- [`BaseChannel`](BaseChannel.md)

## Constructors

### Constructor

> **new TextChannel**(`client`, `data`): `TextChannel`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `data` | \{ \} |

#### Returns

`TextChannel`

#### Overrides

[`BaseChannel`](BaseChannel.md).[`constructor`](BaseChannel.md#constructor)

## Properties

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

### createdAt

> **createdAt**: `Date`

***

### createdTimestamp

> **createdTimestamp**: `number`

***

### defaultPermissions?

> `optional` **defaultPermissions?**: \{ `a`: `number`; `d`: `number`; \} \| `null`

***

### description?

> `optional` **description?**: `string` \| `null`

***

### icon?

> `optional` **icon?**: [`Attachment`](Attachment.md) \| `null`

***

### id

> `readonly` **id**: `string`

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`id`](BaseChannel.md#id)

***

### lastMessageId?

> `optional` **lastMessageId?**: `string` \| `null`

***

### messages

> **messages**: [`MessageManager`](MessageManager.md)

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`messages`](BaseChannel.md#messages)

***

### name

> **name**: `string`

***

### nsfw?

> `optional` **nsfw?**: `boolean`

***

### serverId

> **serverId**: `string`

***

### slowmode?

> `optional` **slowmode?**: `number`

***

### type

> **type**: [`ChannelType`](../type-aliases/ChannelType.md)

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`type`](BaseChannel.md#type)

***

### voice?

> `optional` **voice?**: `any`

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

> **\_patch**(`data`, `clear?`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |
| `clear?` | (`"Description"` \| `"Icon"` \| `"DefaultPermissions"` \| `"Voice"` \| `"Slowmode"`)[] |

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

### isVoice()

> **isVoice**(): `this is VoiceChannel`

#### Returns

`this is VoiceChannel`

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`isVoice`](BaseChannel.md#isvoice)

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

### setCategory()

> **setCategory**(`category`): `Promise`\<`TextChannel`\>

Edits the category of this channel. Only applicable to server channels.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `category` | `string` | The ID of the category to move this channel into, or "default" to remove from any category. |

#### Returns

`Promise`\<`TextChannel`\>

The updated TextChannel with the new category.

#### Throws

If the channel is not a server channel, if the category is not found in the server, or if the API request fails.

#### Example

```ts
// Move this channel into a category
await channel.setCategory("CATEGORY_ID");
// Remove this channel from its category
await channel.setCategory("default");
```

***

### setDefaultPermissions()

> **setDefaultPermissions**(`permissions`): `Promise`\<`TextChannel`\>

Updates the default (everyone) permissions for this channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `permissions` | [`PermissionResolvable`](../type-aliases/PermissionResolvable.md) | The default permissions to grant globally in this channel. |

#### Returns

`Promise`\<`TextChannel`\>

A promise that resolves to the updated BaseChannel.

#### Throws

If invalid permissions are provided.

#### Throws

If the API request fails.

#### Example

```ts
// Set the default permission to allow everyone to view the channel
await channel.setDefaultPermissions(["ViewChannel", "ReadMessageHistory"]);
```

***

### setDescription()

> **setDescription**(`description`): `Promise`\<`TextChannel`\>

Edit the description of this channel

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `description` | `string` \| `null` | - |

#### Returns

`Promise`\<`TextChannel`\>

The updated TextChannel

#### Throws

If the API request fails

#### Example

```ts
// Set the channel description
await channel.setDescription("This is a channel about cats!");
// Remove the channel description
await channel.setDescription(null);
```

***

### setIcon()

> **setIcon**(`id`): `Promise`\<`TextChannel`\>

Set the channel Icon

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` \| `null` | Autumn ID to use |

#### Returns

`Promise`\<`TextChannel`\>

The updated TextChannel

#### Throws

If the API request fails

#### Example

```ts
await channel.setIcon("123");
// Remove the channel icon
await channel.setIcon(null);
```

***

### setName()

> **setName**(`name`): `Promise`\<`TextChannel`\>

Edit the name of this channel

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | - |

#### Returns

`Promise`\<`TextChannel`\>

The updated TextChannel

#### Throws

If the API request fails

#### Example

```ts
await channel.setName("New Name");
```

***

### setNSFW()

> **setNSFW**(`nsfw`): `Promise`\<`TextChannel`\>

Set whether this channel is NSFW

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `nsfw` | `boolean` | - |

#### Returns

`Promise`\<`TextChannel`\>

The updated TextChannel

#### Throws

If the API request fails

#### Example

```ts
// Mark the channel as NSFW
await channel.setNSFW(true);
// Mark the channel as SFW
await channel.setNSFW(false);
```

***

### setPosition()

> **setPosition**(`position`): `Promise`\<`TextChannel`\>

Sets the position of this channel within its current category.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `position` | `number` | The new index position for the channel within its category. |

#### Returns

`Promise`\<`TextChannel`\>

The updated TextChannel.

#### Throws

If the channel is not in a category, or if the API request fails.

#### Example

```ts
// Move channel to the top of its category
await channel.setPosition(0);
```

***

### setRolePermissions()

> **setRolePermissions**(`roleId`, `options`): `Promise`\<`TextChannel`\>

Updates the permission overrides for the channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `roleId` | `string` | The raw string ID of the role to update. |
| `options` | [`ChannelRolePermissionOptions`](../interfaces/ChannelRolePermissionOptions.md) | The allow and deny permissions to set. |

#### Returns

`Promise`\<`TextChannel`\>

A promise that resolves to the updated BaseChannel.

#### Throws

If the channel is not a Server Channel, or options are invalid.

#### Throws

If the API request fails.

#### Example

```ts
// Deny a role the ability to send messages in this channel
await channel.setRolePermissions("ROLE_ID", { deny: ["SendMessage"] });
```

***

### setSlowmode()

> **setSlowmode**(`slowmode`): `Promise`\<`TextChannel`\>

Set the channel slowmode in seconds

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `slowmode` | `number` | - |

#### Returns

`Promise`\<`TextChannel`\>

The updated TextChannel

#### Throws

If the API request fails

#### Example

```ts
// Set the slowmode to 5 seconds
await channel.setSlowmode(5);
// Remove slowmode
await channel.setSlowmode(0);
```

***

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`toString`](BaseChannel.md#tostring)
