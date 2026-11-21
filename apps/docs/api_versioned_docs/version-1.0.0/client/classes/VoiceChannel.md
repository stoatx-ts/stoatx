# Class: VoiceChannel

A server voice channel. To join its call, use `VoiceManager` from `@stoatx/voice-node`
or `@stoatx/voice-browser`: `await voice.join(channel)`.

## Extends

- [`TextChannel`](TextChannel.md)

## Constructors

### Constructor

> **new VoiceChannel**(`client`, `data`): `VoiceChannel`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `data` | \{ \} |

#### Returns

`VoiceChannel`

#### Inherited from

[`TextChannel`](TextChannel.md).[`constructor`](TextChannel.md#constructor)

## Properties

### cachedAt

> **cachedAt**: `number`

#### Inherited from

[`TextChannel`](TextChannel.md).[`cachedAt`](TextChannel.md#cachedat)

***

### client

> `protected` `readonly` **client**: [`Client`](Client.md)

#### Inherited from

[`TextChannel`](TextChannel.md).[`client`](TextChannel.md#client)

***

### createdAt

> **createdAt**: `Date`

#### Inherited from

[`TextChannel`](TextChannel.md).[`createdAt`](TextChannel.md#createdat)

***

### createdTimestamp

> **createdTimestamp**: `number`

#### Inherited from

[`TextChannel`](TextChannel.md).[`createdTimestamp`](TextChannel.md#createdtimestamp)

***

### defaultPermissions?

> `optional` **defaultPermissions?**: \{ `a`: `number`; `d`: `number`; \} \| `null`

#### Inherited from

[`TextChannel`](TextChannel.md).[`defaultPermissions`](TextChannel.md#defaultpermissions)

***

### description?

> `optional` **description?**: `string` \| `null`

#### Inherited from

[`TextChannel`](TextChannel.md).[`description`](TextChannel.md#description)

***

### icon?

> `optional` **icon?**: [`Attachment`](Attachment.md) \| `null`

#### Inherited from

[`TextChannel`](TextChannel.md).[`icon`](TextChannel.md#icon)

***

### id

> `readonly` **id**: `string`

#### Inherited from

[`TextChannel`](TextChannel.md).[`id`](TextChannel.md#id)

***

### lastMessageId?

> `optional` **lastMessageId?**: `string` \| `null`

#### Inherited from

[`TextChannel`](TextChannel.md).[`lastMessageId`](TextChannel.md#lastmessageid)

***

### messages

> **messages**: [`MessageManager`](MessageManager.md)

#### Inherited from

[`TextChannel`](TextChannel.md).[`messages`](TextChannel.md#messages)

***

### name

> **name**: `string`

#### Inherited from

[`TextChannel`](TextChannel.md).[`name`](TextChannel.md#name)

***

### nsfw?

> `optional` **nsfw?**: `boolean`

#### Inherited from

[`TextChannel`](TextChannel.md).[`nsfw`](TextChannel.md#nsfw)

***

### serverId

> **serverId**: `string`

#### Inherited from

[`TextChannel`](TextChannel.md).[`serverId`](TextChannel.md#serverid)

***

### slowmode?

> `optional` **slowmode?**: `number`

#### Inherited from

[`TextChannel`](TextChannel.md).[`slowmode`](TextChannel.md#slowmode)

***

### type

> **type**: [`ChannelType`](../type-aliases/ChannelType.md)

#### Inherited from

[`TextChannel`](TextChannel.md).[`type`](TextChannel.md#type)

***

### typingUserIds

> `readonly` **typingUserIds**: `Set`\<`string`\>

IDs of the users currently typing in this channel, kept up to date from gateway events.
Cleared when a user sends a message or stops typing, and on reconnect.

#### Inherited from

[`TextChannel`](TextChannel.md).[`typingUserIds`](TextChannel.md#typinguserids)

***

### voice?

> `optional` **voice?**: `any`

#### Inherited from

[`TextChannel`](TextChannel.md).[`voice`](TextChannel.md#voice)

***

### webhooks

> **webhooks**: [`WebhookManager`](WebhookManager.md)

#### Inherited from

[`TextChannel`](TextChannel.md).[`webhooks`](TextChannel.md#webhooks)

## Accessors

### mentionCount

#### Get Signature

> **get** **mentionCount**(): `number`

How many unread messages in this channel mention the logged-in user. Always `0` for bots.

##### Returns

`number`

#### Inherited from

[`TextChannel`](TextChannel.md).[`mentionCount`](TextChannel.md#mentioncount)

***

### unread

#### Get Signature

> **get** **unread**(): `boolean`

##### Returns

`boolean`

#### Inherited from

[`TextChannel`](TextChannel.md).[`unread`](TextChannel.md#unread)

***

### voiceStates

#### Get Signature

> **get** **voiceStates**(): [`Collection`](Collection.md)\<`string`, [`VoiceState`](VoiceState.md)\>

Everyone in this channel's voice call, by user ID. Empty if nobody is in it.

##### Returns

[`Collection`](Collection.md)\<`string`, [`VoiceState`](VoiceState.md)\>

#### Inherited from

[`TextChannel`](TextChannel.md).[`voiceStates`](TextChannel.md#voicestates)

## Methods

### \_clone()

> **\_clone**(): `this`

Creates a snapshot of this structure. Plain nested data (objects and arrays)
is copied so later patches to the original do not leak into the snapshot;
class instances (client, managers, other structures) are shared by reference.

#### Returns

`this`

#### Inherited from

[`TextChannel`](TextChannel.md).[`_clone`](TextChannel.md#_clone)

***

### \_patch()

> **\_patch**(`data`, `clear?`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |
| `clear?` | (`"Voice"` \| `"Description"` \| `"Icon"` \| `"DefaultPermissions"` \| `"Slowmode"`)[] |

#### Returns

`void`

#### Inherited from

[`TextChannel`](TextChannel.md).[`_patch`](TextChannel.md#_patch)

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

#### Inherited from

[`TextChannel`](TextChannel.md).[`ack`](TextChannel.md#ack)

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

[`TextChannel`](TextChannel.md).[`awaitMessages`](TextChannel.md#awaitmessages)

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

[`TextChannel`](TextChannel.md).[`bulkDelete`](TextChannel.md#bulkdelete)

***

### createInvite()

> **createInvite**(`options?`): `Promise`\<[`ServerInvite`](ServerInvite.md)\>

Creates an invite to this channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`InviteCreateOptions`](../interfaces/InviteCreateOptions.md) | A use limit and expiry time. |

#### Returns

`Promise`\<[`ServerInvite`](ServerInvite.md)\>

The new invite. Share its `code`.

#### Example

```ts
const invite = await channel.createInvite({ maxUses: 10, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) });
```

#### Inherited from

[`TextChannel`](TextChannel.md).[`createInvite`](TextChannel.md#createinvite)

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

[`TextChannel`](TextChannel.md).[`createMessageCollector`](TextChannel.md#createmessagecollector)

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

[`TextChannel`](TextChannel.md).[`delete`](TextChannel.md#delete)

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

[`TextChannel`](TextChannel.md).[`edit`](TextChannel.md#edit)

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

[`TextChannel`](TextChannel.md).[`equals`](TextChannel.md#equals)

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

[`TextChannel`](TextChannel.md).[`fetch`](TextChannel.md#fetch)

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

#### Inherited from

[`TextChannel`](TextChannel.md).[`fetchMessages`](TextChannel.md#fetchmessages)

***

### isDM()

> **isDM**(): `this is DMChannel`

#### Returns

`this is DMChannel`

#### Inherited from

[`TextChannel`](TextChannel.md).[`isDM`](TextChannel.md#isdm)

***

### isGroup()

> **isGroup**(): `this is GroupChannel`

#### Returns

`this is GroupChannel`

#### Inherited from

[`TextChannel`](TextChannel.md).[`isGroup`](TextChannel.md#isgroup)

***

### isText()

> **isText**(): `this is TextChannel`

#### Returns

`this is TextChannel`

#### Inherited from

[`TextChannel`](TextChannel.md).[`isText`](TextChannel.md#istext)

***

### isVoice()

> **isVoice**(): `this is VoiceChannel`

#### Returns

`this is VoiceChannel`

#### Inherited from

[`TextChannel`](TextChannel.md).[`isVoice`](TextChannel.md#isvoice)

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

[`TextChannel`](TextChannel.md).[`send`](TextChannel.md#send)

***

### setCategory()

> **setCategory**(`category`): `Promise`\<[`TextChannel`](TextChannel.md)\>

Edits the category of this channel. Only applicable to server channels.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `category` | `string` | The ID of the category to move this channel into, or "default" to remove from any category. |

#### Returns

`Promise`\<[`TextChannel`](TextChannel.md)\>

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

#### Inherited from

[`TextChannel`](TextChannel.md).[`setCategory`](TextChannel.md#setcategory)

***

### setDefaultPermissions()

> **setDefaultPermissions**(`permissions`): `Promise`\<`VoiceChannel`\>

Updates the default (everyone) permissions for this channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `permissions` | [`PermissionResolvable`](../type-aliases/PermissionResolvable.md) | The default permissions to grant globally in this channel. |

#### Returns

`Promise`\<`VoiceChannel`\>

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

#### Inherited from

[`TextChannel`](TextChannel.md).[`setDefaultPermissions`](TextChannel.md#setdefaultpermissions)

***

### setDescription()

> **setDescription**(`description`): `Promise`\<[`TextChannel`](TextChannel.md)\>

Edit the description of this channel

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `description` | `string` \| `null` | - |

#### Returns

`Promise`\<[`TextChannel`](TextChannel.md)\>

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

#### Inherited from

[`TextChannel`](TextChannel.md).[`setDescription`](TextChannel.md#setdescription)

***

### setIcon()

> **setIcon**(`id`): `Promise`\<[`TextChannel`](TextChannel.md)\>

Set the channel Icon

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` \| `null` | Autumn ID to use |

#### Returns

`Promise`\<[`TextChannel`](TextChannel.md)\>

The updated TextChannel

#### Throws

If the API request fails

#### Example

```ts
await channel.setIcon("123");
// Remove the channel icon
await channel.setIcon(null);
```

#### Inherited from

[`TextChannel`](TextChannel.md).[`setIcon`](TextChannel.md#seticon)

***

### setName()

> **setName**(`name`): `Promise`\<[`TextChannel`](TextChannel.md)\>

Edit the name of this channel

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | - |

#### Returns

`Promise`\<[`TextChannel`](TextChannel.md)\>

The updated TextChannel

#### Throws

If the API request fails

#### Example

```ts
await channel.setName("New Name");
```

#### Inherited from

[`TextChannel`](TextChannel.md).[`setName`](TextChannel.md#setname)

***

### setNSFW()

> **setNSFW**(`nsfw`): `Promise`\<[`TextChannel`](TextChannel.md)\>

Set whether this channel is NSFW

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `nsfw` | `boolean` | - |

#### Returns

`Promise`\<[`TextChannel`](TextChannel.md)\>

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

#### Inherited from

[`TextChannel`](TextChannel.md).[`setNSFW`](TextChannel.md#setnsfw)

***

### setPosition()

> **setPosition**(`position`): `Promise`\<[`TextChannel`](TextChannel.md)\>

Sets the position of this channel within its current category.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `position` | `number` | The new index position for the channel within its category. |

#### Returns

`Promise`\<[`TextChannel`](TextChannel.md)\>

The updated TextChannel.

#### Throws

If the channel is not in a category, or if the API request fails.

#### Example

```ts
// Move channel to the top of its category
await channel.setPosition(0);
```

#### Inherited from

[`TextChannel`](TextChannel.md).[`setPosition`](TextChannel.md#setposition)

***

### setRolePermissions()

> **setRolePermissions**(`roleId`, `options`): `Promise`\<`VoiceChannel`\>

Updates the permission overrides for the channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `roleId` | `string` | The raw string ID of the role to update. |
| `options` | [`ChannelRolePermissionOptions`](../interfaces/ChannelRolePermissionOptions.md) | The allow and deny permissions to set. |

#### Returns

`Promise`\<`VoiceChannel`\>

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

#### Inherited from

[`TextChannel`](TextChannel.md).[`setRolePermissions`](TextChannel.md#setrolepermissions)

***

### setSlowmode()

> **setSlowmode**(`slowmode`): `Promise`\<[`TextChannel`](TextChannel.md)\>

Set the channel slowmode in seconds

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `slowmode` | `number` | - |

#### Returns

`Promise`\<[`TextChannel`](TextChannel.md)\>

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

#### Inherited from

[`TextChannel`](TextChannel.md).[`setSlowmode`](TextChannel.md#setslowmode)

***

### startTyping()

> **startTyping**(): `boolean`

Shows the logged-in user as typing in this channel. Safe to call on every keystroke:
it sends at most once every 2.5 seconds, and other clients drop the indicator after
4 seconds without a refresh. Call [stopTyping](BaseChannel.md#stoptyping) when the user stops, or just send
the message: sending ends the indicator.

#### Returns

`boolean`

`false` if the gateway isn't connected.

#### Inherited from

[`TextChannel`](TextChannel.md).[`startTyping`](TextChannel.md#starttyping)

***

### stopTyping()

> **stopTyping**(): `boolean`

Stops showing the logged-in user as typing in this channel.

#### Returns

`boolean`

`false` if the gateway isn't connected.

#### Inherited from

[`TextChannel`](TextChannel.md).[`stopTyping`](TextChannel.md#stoptyping)

***

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`TextChannel`](TextChannel.md).[`toString`](TextChannel.md#tostring)
