# Class: GroupChannel

The base class for all structures.

## Extends

- [`BaseChannel`](BaseChannel.md)

## Constructors

### Constructor

> **new GroupChannel**(`client`, `data`): `GroupChannel`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `data` | \{ \} |

#### Returns

`GroupChannel`

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

### description?

> `optional` **description?**: `string` \| `null` = `null`

***

### icon

> **icon**: [`Attachment`](Attachment.md) \| `null` = `null`

***

### id

> `readonly` **id**: `string`

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`id`](BaseChannel.md#id)

***

### lastMessageId?

> `optional` **lastMessageId?**: `string` \| `null` = `null`

***

### messages

> **messages**: [`MessageManager`](MessageManager.md)

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`messages`](BaseChannel.md#messages)

***

### name

> **name**: `string`

***

### nsfw

> **nsfw**: `boolean` = `false`

***

### ownerId

> **ownerId**: `string`

***

### recipients

> **recipients**: `string`[] = `[]`

***

### type

> **type**: [`ChannelType`](../type-aliases/ChannelType.md)

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`type`](BaseChannel.md#type)

***

### typingUserIds

> `readonly` **typingUserIds**: `Set`\<`string`\>

IDs of the users currently typing in this channel, kept up to date from gateway events.
Cleared when a user sends a message or stops typing, and on reconnect.

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`typingUserIds`](BaseChannel.md#typinguserids)

***

### webhooks

> **webhooks**: `WebhookManager`

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`webhooks`](BaseChannel.md#webhooks)

## Accessors

### mentionCount

#### Get Signature

> **get** **mentionCount**(): `number`

How many unread messages in this channel mention the logged-in user. Always `0` for bots.

##### Returns

`number`

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`mentionCount`](BaseChannel.md#mentioncount)

***

### owner

#### Get Signature

> **get** **owner**(): [`User`](User.md) \| `undefined`

Gets the User object of the person who owns this group

##### Returns

[`User`](User.md) \| `undefined`

***

### recipientUsers

#### Get Signature

> **get** **recipientUsers**(): [`User`](User.md)[]

Resolves the recipient IDs into an array of cached User objects

##### Returns

[`User`](User.md)[]

***

### unread

#### Get Signature

> **get** **unread**(): `boolean`

Whether this channel has messages the logged-in user hasn't read. Always `false` for bots.

##### Returns

`boolean`

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`unread`](BaseChannel.md#unread)

## Methods

### \_clone()

> **\_clone**(): `this`

Creates a snapshot of this structure. Plain nested data (objects and arrays)
is copied so later patches to the original do not leak into the snapshot;
class instances (client, managers, other structures) are shared by reference.

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
| `clear?` | (`"Voice"` \| `"Description"` \| `"Icon"` \| `"DefaultPermissions"` \| `"Slowmode"`)[] |

#### Returns

`void`

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

[`BaseChannel`](BaseChannel.md).[`ack`](BaseChannel.md#ack)

***

### addMember()

> **addMember**(`user`): `Promise`\<`void`\>

Adds a user to the group. They must be a friend of the logged-in user.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `user` | [`UserResolvable`](../type-aliases/UserResolvable.md) | The user to add. |

#### Returns

`Promise`\<`void`\>

#### Throws

`NotFriends`, `AlreadyInGroup`, `GroupTooLarge`, or `MissingPermission`.

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

### fetchMembers()

> **fetchMembers**(): `Promise`\<[`Collection`](Collection.md)\<`string`, [`User`](User.md)\>\>

Fetches the group's members and caches them.

#### Returns

`Promise`\<[`Collection`](Collection.md)\<`string`, [`User`](User.md)\>\>

The members, keyed by user ID.

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

### leave()

> **leave**(`options?`): `Promise`\<`void`\>

Leaves the group and removes it from the cache.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `silent?`: `boolean`; \} | Set `silent` to leave without a "user left" message in the group. |
| `options.silent?` | `boolean` | - |

#### Returns

`Promise`\<`void`\>

***

### removeMember()

> **removeMember**(`user`): `Promise`\<`void`\>

Removes a user from the group. Only the owner can do this.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `user` | [`UserResolvable`](../type-aliases/UserResolvable.md) | The user to remove. To leave the group yourself, use [leave](#leave). |

#### Returns

`Promise`\<`void`\>

#### Throws

`NotOwner`, `NotInGroup`, or `CannotRemoveYourself`.

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

### setDefaultPermissions()

> **setDefaultPermissions**(`permissions`): `Promise`\<`GroupChannel`\>

Updates the default (everyone) permissions for this channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `permissions` | [`PermissionResolvable`](../type-aliases/PermissionResolvable.md) | The default permissions to grant globally in this channel. |

#### Returns

`Promise`\<`GroupChannel`\>

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

[`BaseChannel`](BaseChannel.md).[`startTyping`](BaseChannel.md#starttyping)

***

### stopRinging()

> **stopRinging**(`user`): `Promise`\<`void`\>

Stops ringing a user for the call in this group. The logged-in user must be in the call.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `user` | [`UserResolvable`](../type-aliases/UserResolvable.md) | The user to stop ringing. |

#### Returns

`Promise`\<`void`\>

#### Throws

`NotConnected` if the logged-in user isn't in the call.

***

### stopTyping()

> **stopTyping**(): `boolean`

Stops showing the logged-in user as typing in this channel.

#### Returns

`boolean`

`false` if the gateway isn't connected.

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`stopTyping`](BaseChannel.md#stoptyping)

***

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`BaseChannel`](BaseChannel.md).[`toString`](BaseChannel.md#tostring)
