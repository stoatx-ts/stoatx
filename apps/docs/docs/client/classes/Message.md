# Class: Message

The base class for all structures.

## Extends

- [`Base`](Base.md)

## Constructors

### Constructor

> **new Message**(`client`, `data`): `Message`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `data` | \{ \} |

#### Returns

`Message`

#### Overrides

[`Base`](Base.md).[`constructor`](Base.md#constructor)

## Properties

### attachments

> **attachments**: [`Attachment`](Attachment.md)[] = `[]`

***

### authorId

> **authorId**: `string`

***

### cachedAt

> **cachedAt**: `number`

#### Inherited from

[`Base`](Base.md).[`cachedAt`](Base.md#cachedat)

***

### channelId

> **channelId**: `string`

***

### client

> `protected` `readonly` **client**: [`Client`](Client.md)

#### Inherited from

[`Base`](Base.md).[`client`](Base.md#client)

***

### content

> **content**: `string` \| `null` = `null`

***

### createdAt

> **createdAt**: `Date`

***

### createdTimestamp

> **createdTimestamp**: `number`

***

### editedAt

> **editedAt**: `Date` \| `null` = `null`

***

### embeds

> **embeds**: (\{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \})[] \| `null` = `[]`

***

### flags

> **flags**: `number` = `0`

***

### id

> `readonly` **id**: `string`

#### Inherited from

[`Base`](Base.md).[`id`](Base.md#id)

***

### interactions

> **interactions**: [`Interaction`](../interfaces/Interaction.md) \| `null` = `null`

***

### masquerade

> **masquerade**: [`Masquerade`](../interfaces/Masquerade.md) \| `null` = `null`

***

### mentions

> **mentions**: `MessageMentions`

***

### pinned

> **pinned**: `boolean` \| `null` = `false`

***

### reactions

> **reactions**: `Record`\<`string`, `string`[]\> = `{}`

***

### replies

> **replies**: `string`[] \| `null` = `[]`

## Accessors

### author

#### Get Signature

> **get** **author**(): [`User`](User.md) \| `undefined`

Gets the Global User object from cache

##### Returns

[`User`](User.md) \| `undefined`

***

### channel

#### Get Signature

> **get** **channel**(): [`BaseChannel`](BaseChannel.md) \| `undefined`

Gets the Channel object from cache

##### Returns

[`BaseChannel`](BaseChannel.md) \| `undefined`

***

### member

#### Get Signature

> **get** **member**(): [`Member`](Member.md) \| `undefined`

Gets the Server Member object (if sent in a server)

##### Returns

[`Member`](Member.md) \| `undefined`

***

### server

#### Get Signature

> **get** **server**(): [`Server`](Server.md) \| `undefined`

Gets the Server object from cache

##### Returns

[`Server`](Server.md) \| `undefined`

***

### serverId

#### Get Signature

> **get** **serverId**(): `string` \| `undefined`

Gets the Server ID if this message was sent in a server channel

##### Returns

`string` \| `undefined`

## Methods

### \_clone()

> **\_clone**(): `this`

Helper to quickly clone a structure

#### Returns

`this`

#### Inherited from

[`Base`](Base.md).[`_clone`](Base.md#_clone)

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

### \[custom\]()

> **\[custom\]**(`depth`, `options`, `inspect`): `string`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `depth` | `number` |
| `options` | `InspectOptions` |
| `inspect` | *typeof* `inspect` |

#### Returns

`string`

***

### awaitReactions()

> **awaitReactions**(`options?`): `Promise`\<[`Collection`](Collection.md)\<`string`, [`MessageReaction`](MessageReaction.md)\>\>

Awaits reactions on this message.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | [`ReactionCollectorOptions`](../interfaces/ReactionCollectorOptions.md) | The options for the collector. |

#### Returns

`Promise`\<[`Collection`](Collection.md)\<`string`, [`MessageReaction`](MessageReaction.md)\>\>

A promise that resolves to a collection of reactions collected.

#### Example

```ts
// Await reactions
const filter = (reaction) => reaction.emoji.id === '123' && reaction.users.has(author.id);
message.awaitReactions({ filter, max: 1, time: 60000 })
  .then(collected => console.log(collected.size))
  .catch(console.error);
```

***

### clearReactions()

> **clearReactions**(): `Promise`\<`void`\>

Remove all reactions from this message

#### Returns

`Promise`\<`void`\>

#### Throws

If the API request fails.

#### Example

```ts
await message.clearReactions();
```

***

### createReactionCollector()

> **createReactionCollector**(`options?`): [`ReactionCollector`](ReactionCollector.md)

Creates a ReactionCollector to collect reactions on this message.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | [`ReactionCollectorOptions`](../interfaces/ReactionCollectorOptions.md) | The options for the collector. |

#### Returns

[`ReactionCollector`](ReactionCollector.md)

A new ReactionCollector instance.

#### Example

```ts
const collector = message.createReactionCollector({ time: 15000 });
collector.on('collect', (reaction) => console.log(`Collected ${reaction.emojiId} from ${reaction.userId}`));
collector.on('end', (collected) => console.log(`Collected ${collected.size} items`));
```

***

### delete()

> **delete**(): `Promise`\<`void`\>

Deletes this message.

#### Returns

`Promise`\<`void`\>

***

### edit()

> **edit**(`contentOrOptions`): `Promise`\<`Message`\>

Edits this message.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `contentOrOptions` | `string` \| [`MessageOptions`](../interfaces/MessageOptions.md) | The new content or options for the message. |

#### Returns

`Promise`\<`Message`\>

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

### pin()

> **pin**(): `Promise`\<`void`\>

Pins this message.

#### Returns

`Promise`\<`void`\>

***

### react()

> **react**(`reaction`): `Promise`\<`void`\>

React to this message

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `reaction` | `string` | The emoji to react with. Can be a Unicode emoji or a custom emoji ID. |

#### Returns

`Promise`\<`void`\>

#### Throws

If the API request fails.

#### Example

```ts
await message.react("👍");
await message.react("customEmojiId");
```

***

### removeReaction()

> **removeReaction**(`reaction`, `userId?`, `removeAll?`): `Promise`\<`void`\>

Remove a reaction from this message

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `reaction` | `string` | The emoji to remove. Can be a Unicode emoji or a custom emoji ID. |
| `userId?` | [`UserResolvable`](../type-aliases/UserResolvable.md) | The ID of the user whose reaction to remove. If not provided, removes the current user's reaction. |
| `removeAll?` | `boolean` | Remove all reactions of this type. |

#### Returns

`Promise`\<`void`\>

#### Throws

If both userId and removeAll are provided, or if the API request fails.

#### Example

```ts
// Remove the current user's reaction
await message.removeReaction("👍");
// Remove a specific user's reaction
await message.removeReaction("👍", userId);
// Remove all reactions of this type
await message.removeReaction("👍", undefined, true);
```

***

### reply()

> **reply**(`contentOrOptions`): `Promise`\<`Message`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `contentOrOptions` | `string` \| [`MessageOptions`](../interfaces/MessageOptions.md) |

#### Returns

`Promise`\<`Message`\>

***

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`Base`](Base.md).[`toString`](Base.md#tostring)

***

### unpin()

> **unpin**(): `Promise`\<`void`\>

Unpins this message.

#### Returns

`Promise`\<`void`\>
