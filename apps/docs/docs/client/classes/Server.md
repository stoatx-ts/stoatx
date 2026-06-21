# Class: Server

The base class for all structures.

## Extends

- [`Base`](Base.md)

## Constructors

### Constructor

> **new Server**(`client`, `data`): `Server`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `data` | \{ \} |

#### Returns

`Server`

#### Overrides

[`Base`](Base.md).[`constructor`](Base.md#constructor)

## Properties

### analytics

> **analytics**: `boolean` = `false`

***

### banner

> **banner**: [`Attachment`](Attachment.md) \| `null` = `null`

***

### bans

> **bans**: `ServerBanManager`

***

### cachedAt

> **cachedAt**: `number`

#### Inherited from

[`Base`](Base.md).[`cachedAt`](Base.md#cachedat)

***

### categories

> **categories**: `object`[] \| `null` = `null`

***

### channelIds

> **channelIds**: `string`[] = `[]`

***

### channels

> **channels**: [`ServerChannelManager`](ServerChannelManager.md)

***

### client

> `protected` `readonly` **client**: [`Client`](Client.md)

#### Inherited from

[`Base`](Base.md).[`client`](Base.md#client)

***

### defaultPermissions

> **defaultPermissions**: `bigint`

***

### description

> **description**: `string` \| `null` = `null`

***

### discoverable

> **discoverable**: `boolean` = `false`

***

### emojis

> **emojis**: [`EmojiManager`](EmojiManager.md)

***

### flags

> **flags**: `number` = `0`

***

### icon

> **icon**: [`Attachment`](Attachment.md) \| `null` = `null`

***

### id

> `readonly` **id**: `string`

#### Inherited from

[`Base`](Base.md).[`id`](Base.md#id)

***

### invites

> **invites**: `ServerInviteManager`

***

### members

> **members**: [`MemberManager`](MemberManager.md)

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

### roles

> **roles**: [`RoleManager`](RoleManager.md)

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

> **\_patch**(`data`, `clear?`): `void`

Updates the server instance with new data without losing the object reference.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |
| `clear?` | `string`[] |

#### Returns

`void`

***

### edit()

> **edit**(`options`): `Promise`\<`Server`\>

Edits this server.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`ServerEditOptions`](../interfaces/ServerEditOptions.md) | The fields to update. |

#### Returns

`Promise`\<`Server`\>

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

### fetchMembers()

> **fetchMembers**(`options?`): `Promise`\<[`Collection`](Collection.md)\<`string`, [`Member`](Member.md)\>\>

Fetches multiple members from this server.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | [`FetchMembersOptions`](../interfaces/FetchMembersOptions.md) | Filter options for the fetch request. |

#### Returns

`Promise`\<[`Collection`](Collection.md)\<`string`, [`Member`](Member.md)\>\>

A Collection of the fetched members.

***

### leave()

> **leave**(): `Promise`\<`never`\>

Leaves the server

#### Returns

`Promise`\<`never`\>

***

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`Base`](Base.md).[`toString`](Base.md#tostring)
