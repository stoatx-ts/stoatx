# Class: User

The base class for all structures.

## Extends

- [`Base`](Base.md)

## Extended by

- [`ClientUser`](ClientUser.md)

## Constructors

### Constructor

> **new User**(`client`, `data`): `User`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `data` | \{ \} |

#### Returns

`User`

#### Overrides

[`Base`](Base.md).[`constructor`](Base.md#constructor)

## Properties

### avatar?

> `optional` **avatar?**: [`Attachment`](Attachment.md) \| `null`

***

### badges?

> `optional` **badges?**: `number`

***

### bot

> **bot**: `false` \| [`BotInformation`](../interfaces/BotInformation.md)

***

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

### createdAt

> **createdAt**: `Date`

***

### createdTimestamp

> **createdTimestamp**: `number`

***

### discriminator

> **discriminator**: `string`

***

### displayName?

> `optional` **displayName?**: `string` \| `null`

***

### flags?

> `optional` **flags?**: `number`

***

### id

> `readonly` **id**: `string`

#### Inherited from

[`Base`](Base.md).[`id`](Base.md#id)

***

### online

> **online**: `boolean`

***

### privileged?

> `optional` **privileged?**: `boolean`

***

### pronouns?

> `optional` **pronouns?**: `string` \| `null` = `null`

***

### relationship

> **relationship**: [`UserRelationShip`](../type-aliases/UserRelationShip.md)

***

### status?

> `optional` **status?**: \{ \} \| `null`

***

### username

> **username**: `string`

## Accessors

### tag

#### Get Signature

> **get** **tag**(): `string`

Convenience getter to return the user's tag (username#discriminator)

##### Returns

`string`

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

### \_patch()

> **\_patch**(`data`, `clear?`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |
| `clear?` | (`"Avatar"` \| `"StatusText"` \| `"StatusPresence"` \| `"ProfileContent"` \| `"ProfileBackground"` \| `"DisplayName"` \| `"Pronouns"` \| `"Internal"`)[] |

#### Returns

`void`

***

### addFriend()

> **addFriend**(): `Promise`\<`User`\>

Sends this user a friend request, or accepts theirs if they sent one (user sessions only).

#### Returns

`Promise`\<`User`\>

This user, with `relationship` now `"Outgoing"` (request sent) or `"Friend"` (accepted).

#### Throws

`AlreadyFriends`, `AlreadySentRequest`, `Blocked`, `BlockedByOther`,
`TooManyPendingFriendRequests`, or `IsBot` if either side is a bot.

***

### block()

> **block**(): `Promise`\<`User`\>

Blocks this user. Any friendship or pending request is removed (user sessions only).

#### Returns

`Promise`\<`User`\>

This user, with `relationship` now `"Blocked"`.

#### Throws

`NoEffect` if they're already blocked.

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

> **fetch**(`force?`): `Promise`\<`User`\>

Fetch a User to update their information

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `force` | `boolean` | `false` | Skip the cache check and force an API request |

#### Returns

`Promise`\<`User`\>

The fetched User object

#### Throws

Error if the user cannot be found or fetched

#### Example

```ts
// Fetch a user
await user.fetch();
```

***

### removeFriend()

> **removeFriend**(): `Promise`\<`User`\>

Removes this user as a friend, cancels a friend request you sent them,
or declines one they sent you (user sessions only).

#### Returns

`Promise`\<`User`\>

This user, with `relationship` now `"None"`.

#### Throws

`NoEffect` if there was no friendship or request.

***

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`Base`](Base.md).[`toString`](Base.md#tostring)

***

### unblock()

> **unblock**(): `Promise`\<`User`\>

Unblocks this user (user sessions only).

#### Returns

`Promise`\<`User`\>

This user, with `relationship` now `"None"`, or `"BlockedOther"` if they still block you.

#### Throws

`NoEffect` if they weren't blocked.
