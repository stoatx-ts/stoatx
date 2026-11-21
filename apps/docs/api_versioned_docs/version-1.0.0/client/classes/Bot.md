# Class: Bot

A bot owned by the logged-in user. Get one from `client.bots`.

## Extends

- [`Base`](Base.md)

## Constructors

### Constructor

> **new Bot**(`client`, `data`): `Bot`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `data` | \{ \} |

#### Returns

`Bot`

#### Overrides

[`Base`](Base.md).[`constructor`](Base.md#constructor)

## Properties

### analytics

> **analytics**: `boolean` = `false`

Whether analytics are collected for the bot. Required to be listed on Discover.

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

### defaultPermissions

> **defaultPermissions**: `bigint` \| `null` = `null`

The permissions the bot asks for when it's invited to a server.

***

### discoverable

> **discoverable**: `boolean` = `false`

Whether the bot is listed on Discover.

***

### flags

> **flags**: `number` = `0`

The bot's flags.

***

### id

> `readonly` **id**: `string`

#### Inherited from

[`Base`](Base.md).[`id`](Base.md#id)

***

### interactionsUrl

> **interactionsUrl**: `string` \| `null` = `null`

Reserved by Stoat for interactions.

***

### ownerId

> **ownerId**: `string`

The ID of the user who owns the bot.

***

### privacyPolicyUrl

> **privacyPolicyUrl**: `string` \| `null` = `null`

A link to the bot's privacy policy.

***

### public

> **public**: `boolean`

Whether anyone can invite the bot, not just its owner.

***

### termsOfServiceUrl

> **termsOfServiceUrl**: `string` \| `null` = `null`

A link to the bot's terms of service.

***

### token

> **token**: `string`

The bot's token. Treat it like a password.

## Accessors

### user

#### Get Signature

> **get** **user**(): [`User`](User.md) \| `undefined`

The bot's user account, if cached. Bots fetched through `client.bots` always have it cached.

##### Returns

[`User`](User.md) \| `undefined`

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
| `data` | `Partial`\<`RawBot`\> |
| `clear?` | (`"Token"` \| `"InteractionsURL"`)[] |

#### Returns

`void`

***

### cancelDiscoverRequest()

> **cancelDiscoverRequest**(): `Promise`\<`void`\>

Withdraws the bot's Discover request. Only works while it's still in the queue.

#### Returns

`Promise`\<`void`\>

***

### delete()

> **delete**(): `Promise`\<`void`\>

Deletes the bot.

#### Returns

`Promise`\<`void`\>

***

### edit()

> **edit**(`options`): `Promise`\<`Bot`\>

Edits the bot.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`BotEditOptions`](../interfaces/BotEditOptions.md) | The fields to change. |

#### Returns

`Promise`\<`Bot`\>

This bot, updated.

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

### fetchDiscoverRequest()

> **fetchDiscoverRequest**(): `Promise`\<[`DiscoverRequest`](../interfaces/DiscoverRequest.md)\>

Fetches where the bot's Discover request is.

#### Returns

`Promise`\<[`DiscoverRequest`](../interfaces/DiscoverRequest.md)\>

The request's status, with the reviewers' reason once it's decided.

***

### inviteToGroup()

> **inviteToGroup**(`group`): `Promise`\<`void`\>

Adds the bot to a group the logged-in user is in.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `group` | `string` \| [`GroupChannel`](GroupChannel.md) | The group or its ID. |

#### Returns

`Promise`\<`void`\>

***

### inviteToServer()

> **inviteToServer**(`server`, `permissions?`): `Promise`\<`void`\>

Adds the bot to a server the logged-in user can manage.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `server` | `string` \| [`Server`](Server.md) | The server or its ID. |
| `permissions?` | [`PermissionResolvable`](../type-aliases/PermissionResolvable.md) | The permissions to give the bot. Defaults to [defaultPermissions](#defaultpermissions). |

#### Returns

`Promise`\<`void`\>

***

### requestDiscover()

> **requestDiscover**(): `Promise`\<`void`\>

Asks to list the bot on Discover. Needs `analytics` turned on. Only does something
on instances that run Discover; elsewhere the request is stored but never reviewed.

#### Returns

`Promise`\<`void`\>

***

### resetToken()

> **resetToken**(): `Promise`\<`string`\>

Generates a new token for the bot. The old token stops working.

#### Returns

`Promise`\<`string`\>

The new token, also set on [token](#token).

***

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`Base`](Base.md).[`toString`](Base.md#tostring)
