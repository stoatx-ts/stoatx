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

### approximateMemberCount?

> `optional` **approximateMemberCount?**: `number`

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

### createdAt

> **createdAt**: `Date`

***

### createdTimestamp

> **createdTimestamp**: `number`

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

## Accessors

### mentionCount

#### Get Signature

> **get** **mentionCount**(): `number`

How many unread messages across this server's channels mention the logged-in user. Always `0` for bots.

##### Returns

`number`

***

### unread

#### Get Signature

> **get** **unread**(): `boolean`

Whether any channel in this server has messages the logged-in user hasn't read. Always `false` for bots.

##### Returns

`boolean`

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

Updates the server instance with new data without losing the object reference.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |
| `clear?` | (`"Description"` \| `"Icon"` \| `"Categories"` \| `"SystemMessages"` \| `"Banner"`)[] |

#### Returns

`void`

***

### ack()

> **ack**(): `Promise`\<`void`\>

Marks every channel in this server as read (user sessions only).

#### Returns

`Promise`\<`void`\>

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

### fetchAuditLogs()

> **fetchAuditLogs**(`options?`): `Promise`\<[`Collection`](Collection.md)\<`string`, `AuditLogEntry`\>\>

Fetch audit logs for this server

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options?` | [`FetchAuditLogsOptions`](../interfaces/FetchAuditLogsOptions.md) | Query params |

#### Returns

`Promise`\<[`Collection`](Collection.md)\<`string`, `AuditLogEntry`\>\>

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

> **leave**(): `Promise`\<`undefined`\>

Leaves the server.

Note: the API uses the same route to delete a server, so if the logged-in user owns
this server it will be deleted.

#### Returns

`Promise`\<`undefined`\>

***

### report()

> **report**(`reason`, `options?`): `Promise`\<`void`\>

Reports this server to Stoat's moderation team.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `reason` | `"NoneSpecified"` \| `"Illegal"` \| `"IllegalGoods"` \| `"IllegalExtortion"` \| `"IllegalPornography"` \| `"IllegalHacking"` \| `"ExtremeViolence"` \| `"PromotesHarm"` \| `"UnsolicitedSpam"` \| `"Raid"` \| `"SpamAbuse"` \| `"ScamsFraud"` \| `"Malware"` \| `"Harassment"` | Why it's being reported. |
| `options?` | [`ReportOptions`](../interfaces/ReportOptions.md) | More details for the moderators. |

#### Returns

`Promise`\<`void`\>

***

### subscribe()

> **subscribe**(): `boolean`

Asks the gateway for presence and member updates from this server (user sessions only; the
server ignores it for bots, which receive these updates anyway).

A subscription lasts 15 minutes, so call this again while the server stays on screen.
Each connection keeps at most 5 subscriptions; subscribing to a 6th drops the least recently used.

#### Returns

`boolean`

`false` if the gateway isn't connected.

***

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`Base`](Base.md).[`toString`](Base.md#tostring)
