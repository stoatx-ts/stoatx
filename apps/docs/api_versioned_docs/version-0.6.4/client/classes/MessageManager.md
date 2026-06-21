# Class: MessageManager

## Extends

- `BaseManager`\<`string`, [`Message`](Message.md)\>

## Constructors

### Constructor

> **new MessageManager**(`client`, `channel`, `limit?`): `MessageManager`

#### Parameters

| Parameter | Type                            | Default value |
| --------- | ------------------------------- | ------------- |
| `client`  | [`Client`](Client.md)           | `undefined`   |
| `channel` | [`BaseChannel`](BaseChannel.md) | `undefined`   |
| `limit`   | `number`                        | `Infinity`    |

#### Returns

`MessageManager`

#### Overrides

`BaseManager<string, Message>.constructor`

## Properties

### cache

> **cache**: [`Collection`](Collection.md)\<`string`, [`Message`](Message.md)\>

#### Inherited from

`BaseManager.cache`

---

### channel

> **channel**: [`BaseChannel`](BaseChannel.md)

---

### client

> **client**: [`Client`](Client.md)

#### Inherited from

`BaseManager.client`

## Methods

### \[custom\]()

> **\[custom\]**(): [`Collection`](Collection.md)\<`string`, [`Message`](Message.md)\>

#### Returns

[`Collection`](Collection.md)\<`string`, [`Message`](Message.md)\>

---

### clearReactions()

> **clearReactions**(`message`): `Promise`\<`void`\>

Remove all reactions from a message
Requires ManageMessages permission.

#### Parameters

| Parameter | Type                                                        | Description                                    |
| --------- | ----------------------------------------------------------- | ---------------------------------------------- |
| `message` | [`MessageResolvable`](../type-aliases/MessageResolvable.md) | The MessageResolvable to clear reactions from. |

#### Returns

`Promise`\<`void`\>

#### Throws

If the API request fails.

#### Example

```ts
await channel.messages.clearReactions(messageId);
```

---

### construct()

> `protected` **construct**(`data`): [`Message`](Message.md)

Tell BaseManager how to build a Message

#### Parameters

| Parameter | Type  |
| --------- | ----- |
| `data`    | \{ \} |

#### Returns

[`Message`](Message.md)

#### Overrides

`BaseManager.construct`

---

### delete()

> **delete**(`message`): `Promise`\<`void`\>

Deletes a message from the channel.

#### Parameters

| Parameter | Type                                                        | Description                      |
| --------- | ----------------------------------------------------------- | -------------------------------- |
| `message` | [`MessageResolvable`](../type-aliases/MessageResolvable.md) | The MessageResolvable to delete. |

#### Returns

`Promise`\<`void`\>

---

### edit()

> **edit**(`message`, `contentOrOptions`): `Promise`\<[`Message`](Message.md)\>

Edits an existing message.

#### Parameters

| Parameter          | Type                                                            | Description                                   |
| ------------------ | --------------------------------------------------------------- | --------------------------------------------- |
| `message`          | [`MessageResolvable`](../type-aliases/MessageResolvable.md)     | The MessageResolvable (object or ID) to edit. |
| `contentOrOptions` | `string` \| [`MessageOptions`](../interfaces/MessageOptions.md) | The new content or options.                   |

#### Returns

`Promise`\<[`Message`](Message.md)\>

A promise that resolves to the updated Message.

---

### extractId()

> `protected` **extractId**(`data`): `string`

Tell BaseManager how to find the ID for Messages

#### Parameters

| Parameter | Type  |
| --------- | ----- |
| `data`    | \{ \} |

#### Returns

`string`

#### Overrides

`BaseManager.extractId`

---

### fetch()

> **fetch**(`id`): `Promise`\<[`Message`](Message.md)\>

#### Parameters

| Parameter | Type     |
| --------- | -------- |
| `id`      | `string` |

#### Returns

`Promise`\<[`Message`](Message.md)\>

---

### fetchMany()

> **fetchMany**(`options?`): `Promise`\<[`Collection`](Collection.md)\<`string`, [`Message`](Message.md)\>\>

Fetches multiple messages from the channel using specific filter parameters.

#### Parameters

| Parameter | Type                                                          | Description                                          |
| --------- | ------------------------------------------------------------- | ---------------------------------------------------- |
| `options` | [`MessageFetchOptions`](../interfaces/MessageFetchOptions.md) | The query parameters to filter the fetched messages. |

#### Returns

`Promise`\<[`Collection`](Collection.md)\<`string`, [`Message`](Message.md)\>\>

A promise that resolves to a Collection of fetched Messages.

#### Throws

If the API request fails.

#### Example

```ts
// Fetch the last 50 messages in the channel
const messages = await channel.messages.fetchMany({ limit: 50, sort: "Latest" });

// Fetch 20 messages before a specific message ID
const history = await channel.messages.fetchMany({ limit: 20, before: "01H..." });
```

---

### pin()

> **pin**(`message`): `Promise`\<`void`\>

Pins a message in the channel.

#### Parameters

| Parameter | Type                                                        | Description                   |
| --------- | ----------------------------------------------------------- | ----------------------------- |
| `message` | [`MessageResolvable`](../type-aliases/MessageResolvable.md) | The MessageResolvable to pin. |

#### Returns

`Promise`\<`void`\>

---

### react()

> **react**(`message`, `reaction`): `Promise`\<`void`\>

React to a message

#### Parameters

| Parameter  | Type                                                        | Description                                                           |
| ---------- | ----------------------------------------------------------- | --------------------------------------------------------------------- |
| `message`  | [`MessageResolvable`](../type-aliases/MessageResolvable.md) | The MessageResolvable to react to.                                    |
| `reaction` | `string`                                                    | The emoji to react with. Can be a Unicode emoji or a custom emoji ID. |

#### Returns

`Promise`\<`void`\>

#### Throws

If the API request fails.

#### Example

```ts
await channel.messages.react(messageId, "👍");
await channel.messages.react(messageId, "customEmojiId");
```

---

### removeReaction()

> **removeReaction**(`message`, `reaction`, `userId?`, `removeAll?`): `Promise`\<`void`\>

Remove a reaction(s) from a message
Requires ManageMessages if changing others' reactions.

#### Parameters

| Parameter    | Type                                                        | Description                                                                                        |
| ------------ | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `message`    | [`MessageResolvable`](../type-aliases/MessageResolvable.md) | The MessageResolvable to remove the reaction from.                                                 |
| `reaction`   | `string`                                                    | The emoji to remove. Can be a unicode emoji or a custom emoji ID.                                  |
| `userId?`    | [`UserResolvable`](../type-aliases/UserResolvable.md)       | The ID of the user whose reaction to remove. If not provided, removes the current user's reaction. |
| `removeAll?` | `boolean`                                                   | Remove all reactions of this type.                                                                 |

#### Returns

`Promise`\<`void`\>

#### Throws

If both userId and removeAll are provided, or if the API request fails.

#### Example

```ts
// Remove the current user's reaction
await channel.messages.removeReaction(messageId, "👍");
// Remove a specific user's reaction
await channel.messages.removeReaction(messageId, "👍", userId);
// Remove all reactions of this type
await channel.messages.removeReaction(messageId, "👍", undefined, true);
```

---

### resolveId()

> **resolveId**(`message`): `string`

#### Parameters

| Parameter | Type                                                        |
| --------- | ----------------------------------------------------------- |
| `message` | [`MessageResolvable`](../type-aliases/MessageResolvable.md) |

#### Returns

`string`

---

### send()

> **send**(`contentOrOptions`): `Promise`\<[`Message`](Message.md)\>

Sends a new message to this channel.

#### Parameters

| Parameter          | Type                                                            | Description                                    |
| ------------------ | --------------------------------------------------------------- | ---------------------------------------------- |
| `contentOrOptions` | `string` \| [`MessageOptions`](../interfaces/MessageOptions.md) | The string content or message options payload. |

#### Returns

`Promise`\<[`Message`](Message.md)\>

A promise that resolves to the sent Message.

---

### unpin()

> **unpin**(`message`): `Promise`\<`void`\>

Unpins a message in the channel.

#### Parameters

| Parameter | Type                                                        | Description                     |
| --------- | ----------------------------------------------------------- | ------------------------------- |
| `message` | [`MessageResolvable`](../type-aliases/MessageResolvable.md) | The MessageResolvable to unpin. |

#### Returns

`Promise`\<`void`\>
