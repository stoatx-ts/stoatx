# Class: AuditLogEntry

The base class for all structures.

## Extends

- [`Base`](Base.md)

## Constructors

### Constructor

> **new AuditLogEntry**(`client`, `data`): `AuditLogEntry`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `data` | \{ \} |

#### Returns

`AuditLogEntry`

#### Overrides

[`Base`](Base.md).[`constructor`](Base.md#constructor)

## Properties

### action

> **action**: \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \} \| \{ \}

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

### id

> `readonly` **id**: `string`

#### Inherited from

[`Base`](Base.md).[`id`](Base.md#id)

***

### reason

> **reason**: `string` \| `null`

***

### serverId

> **serverId**: `string`

***

### targetId

> **targetId**: `string` \| `null`

***

### userId

> **userId**: `string`

## Accessors

### executor

#### Get Signature

> **get** **executor**(): [`User`](User.md) \| `undefined`

The user who performed this action, if cached.

##### Returns

[`User`](User.md) \| `undefined`

***

### server

#### Get Signature

> **get** **server**(): [`Server`](Server.md) \| `undefined`

##### Returns

[`Server`](Server.md) \| `undefined`

***

### target

#### Get Signature

> **get** **target**(): `unknown`

Best-effort resolve of `targetId` into the actual entity, picked by
`action.type` since a bare id alone doesn't say whether it's a member,
a role, a channel, etc.

##### Returns

`unknown`

***

### type

#### Get Signature

> **get** **type**(): `"MessageDelete"` \| `"MessageBulkDelete"` \| `"MessagePin"` \| `"MessageUnpin"` \| `"BanCreate"` \| `"BanDelete"` \| `"ChannelCreate"` \| `"ChannelEdit"` \| `"ChannelRolePermissionsEdit"` \| `"ChannelDelete"` \| `"MemberEdit"` \| `"MemberKick"` \| `"ServerEdit"` \| `"RoleEdit"` \| `"RoleCreate"` \| `"RoleDelete"` \| `"RolesReorder"` \| `"InviteCreate"` \| `"InviteDelete"` \| `"WebhookCreate"` \| `"WebhookDelete"` \| `"EmojiCreate"` \| `"EmojiUpdate"` \| `"EmojiDelete"`

The action tag, e.g. "ChannelEdit" — narrow `entry.action` on this.

##### Returns

`"MessageDelete"` \| `"MessageBulkDelete"` \| `"MessagePin"` \| `"MessageUnpin"` \| `"BanCreate"` \| `"BanDelete"` \| `"ChannelCreate"` \| `"ChannelEdit"` \| `"ChannelRolePermissionsEdit"` \| `"ChannelDelete"` \| `"MemberEdit"` \| `"MemberKick"` \| `"ServerEdit"` \| `"RoleEdit"` \| `"RoleCreate"` \| `"RoleDelete"` \| `"RolesReorder"` \| `"InviteCreate"` \| `"InviteDelete"` \| `"WebhookCreate"` \| `"WebhookDelete"` \| `"EmojiCreate"` \| `"EmojiUpdate"` \| `"EmojiDelete"`

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

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`Base`](Base.md).[`toString`](Base.md#tostring)
