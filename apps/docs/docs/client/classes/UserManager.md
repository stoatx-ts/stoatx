# Class: UserManager

## Extends

- `BaseManager`\<`string`, [`User`](User.md), `RawUser`\>

## Constructors

### Constructor

> **new UserManager**(`client`, `limit?`): `UserManager`

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | `undefined` |
| `limit` | `number` | `Infinity` |

#### Returns

`UserManager`

#### Overrides

`BaseManager<string, User, RawUser>.constructor`

## Properties

### cache

> **cache**: [`Collection`](Collection.md)\<`string`, [`User`](User.md)\>

#### Inherited from

`BaseManager.cache`

***

### client

> **client**: [`Client`](Client.md)

#### Inherited from

`BaseManager.client`

## Accessors

### blocked

#### Get Signature

> **get** **blocked**(): [`Collection`](Collection.md)\<`string`, [`User`](User.md)\>

Users you've blocked.

##### Returns

[`Collection`](Collection.md)\<`string`, [`User`](User.md)\>

***

### friends

#### Get Signature

> **get** **friends**(): [`Collection`](Collection.md)\<`string`, [`User`](User.md)\>

Users you're friends with (user sessions only).

##### Returns

[`Collection`](Collection.md)\<`string`, [`User`](User.md)\>

***

### incomingFriendRequests

#### Get Signature

> **get** **incomingFriendRequests**(): [`Collection`](Collection.md)\<`string`, [`User`](User.md)\>

Users who sent you a friend request you haven't answered. Accept with `addFriend()`, decline with `removeFriend()`.

##### Returns

[`Collection`](Collection.md)\<`string`, [`User`](User.md)\>

***

### outgoingFriendRequests

#### Get Signature

> **get** **outgoingFriendRequests**(): [`Collection`](Collection.md)\<`string`, [`User`](User.md)\>

Users you sent a friend request to that they haven't answered. Cancel with `removeFriend()`.

##### Returns

[`Collection`](Collection.md)\<`string`, [`User`](User.md)\>

## Methods

### construct()

> `protected` **construct**(`data`): [`User`](User.md)

Tell BaseManager how to build a User

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |

#### Returns

[`User`](User.md)

#### Overrides

`BaseManager.construct`

***

### createDM()

> **createDM**(`user`, `options?`): `Promise`\<[`DMChannel`](DMChannel.md)\>

Creates a DM channel between the client's user and another user.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `user` | [`UserResolvable`](../type-aliases/UserResolvable.md) | The UserResolvable to create a DM with. |
| `options` | \{ `force?`: `boolean`; \} | Additional options for DM creation. |
| `options.force?` | `boolean` | If true, forces the creation of a new DM channel even if one already exists. |

#### Returns

`Promise`\<[`DMChannel`](DMChannel.md)\>

A promise that resolves to the created DMChannel object.

#### Throws

If an invalid UserResolvable is provided.

#### Throws

If the API request fails.

#### Example

```ts
// Create a DM with a user by ID
const dm = await client.users.createDM("1234567890");
console.log(`DM channel ID: ${dm.id}`);
```

***

### editMe()

> **editMe**(`options`): `Promise`\<[`User`](User.md)\>

Edits the logged-in user (the bot, or the user account for user sessions).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`UserEditOptions`](../interfaces/UserEditOptions.md) | The fields to update (avatar, status, profile, etc.). |

#### Returns

`Promise`\<[`User`](User.md)\>

A promise that resolves to the updated User object.

#### Throws

If invalid options are provided.

#### Throws

If the API request fails.

#### Example

```ts
// Update your status and presence
await client.users.editMe({
  status: { text: "Watching the server", presence: "Online" }
});

// Clear your avatar and display name
await client.users.editMe({ avatar: null, displayName: null });
```

***

### extractId()

> `protected` **extractId**(`data`): `string`

Tell BaseManager how to find the ID for Users

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |

#### Returns

`string`

#### Overrides

`BaseManager.extractId`

***

### fetch()

> **fetch**(`user`, `force?`): `Promise`\<[`User`](User.md)\>

Fetches a User.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `user` | [`UserResolvable`](../type-aliases/UserResolvable.md) | `undefined` | The ID or mention to fetch |
| `force` | `boolean` | `false` | Skip the cache check and force an API request |

#### Returns

`Promise`\<[`User`](User.md)\>

The fetched User object

#### Throws

Error if the user cannot be found or fetched

#### Throws

TypeError if invalid UserResolvable is provided

#### Example

```ts
// Fetch a user by ID
const user = await client.users.fetch("01JE2MM759J5D7CHJF084R7MJ2");
console.log(user.username);

// Fetch a user by mention
const user = await client.users.fetch("<@01JE2MM759J5D7CHJF084R7MJ2>");
console.log(user.username);

// Force fetch a user, bypassing the cache
const user = await client.users.fetch("01JE2MM759J5D7CHJF084R7MJ2", true);
console.log(user.username);
```

***

### fetchDMs()

> **fetchDMs**(): `Promise`\<[`Collection`](Collection.md)\<`string`, [`BaseChannel`](BaseChannel.md)\>\>

Fetches every DM, group and Saved Messages channel you're in (user sessions only).
These already arrive when the client connects, so this is only needed to resync.

#### Returns

`Promise`\<[`Collection`](Collection.md)\<`string`, [`BaseChannel`](BaseChannel.md)\>\>

The channels, keyed by ID.

***

### fetchMe()

> **fetchMe**(): `Promise`\<[`User`](User.md)\>

Fetch the logged-in user (the bot, or the user account for user sessions).

#### Returns

`Promise`\<[`User`](User.md)\>

The fetched User object representing the current user.

#### Throws

Error if the user cannot be fetched.

#### Example

```ts
// Fetch the logged-in user
const me = await client.users.fetchMe();
console.log(`Logged in as ${me.tag}`);
```

***

### resolve()

> **resolve**(`user`): [`User`](User.md) \| `undefined`

Resolves a UserResolvable to a User object from the cache.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `user` | [`UserResolvable`](../type-aliases/UserResolvable.md) |

#### Returns

[`User`](User.md) \| `undefined`

***

### resolveId()

> **resolveId**(`user`): `string`

Extracts ID from a UserResolvable.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `user` | [`UserResolvable`](../type-aliases/UserResolvable.md) | The UserResolvable to extract the ID from. |

#### Returns

`string`

The extracted user ID.

#### Throws

TypeError if an invalid type is provided.

***

### sendFriendRequest()

> **sendFriendRequest**(`username`): `Promise`\<[`User`](User.md)\>

Sends a friend request by username (user sessions only).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `username` | `string` | The full username with discriminator, e.g. `"alice#1234"`. |

#### Returns

`Promise`\<[`User`](User.md)\>

The user the request was sent to, with `relationship` `"Outgoing"`,
or `"Friend"` if they had already sent you a request.

#### Throws

If `username` has no `#discriminator`.

#### Throws

`NotFound` if no such user exists, plus the errors from [User.addFriend](User.md#addfriend).
