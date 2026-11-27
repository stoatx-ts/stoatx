# Class: ServerInvite

An invite to a server channel or a group. Server invites are listed in `server.invites`.

## Constructors

### Constructor

> **new ServerInvite**(`client`, `data`): `ServerInvite`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | The client the invite belongs to. |
| `data` | \{ \} \| \{ \} | The raw invite. |

#### Returns

`ServerInvite`

## Properties

### channelId

> **channelId**: `string`

The ID of the channel (or group) it leads to.

***

### code

> **code**: `string`

The invite code, e.g. the `abc123` in `https://stt.gg/abc123` on stoat.chat.

***

### creatorId

> **creatorId**: `string`

The ID of the user who created it.

***

### expiresAt

> **expiresAt**: `Date` \| `null`

When it stops working, or `null` if it never expires.

***

### maxUses

> **maxUses**: `number` \| `null`

How many times it can be used, or `null` for no limit.

***

### serverId

> **serverId**: `string` \| `null`

The ID of the server it leads to, or `null` for group invites.

***

### type

> **type**: `"Server"` \| `"Group"`

Whether it invites to a server or a group.

***

### uses

> **uses**: `number`

How many times it has been used.

## Methods

### \_patch()

> **\_patch**(`data`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} \| \{ \} |

#### Returns

`void`

***

### delete()

> **delete**(): `Promise`\<`void`\>

Deletes the invite, so it stops working.

#### Returns

`Promise`\<`void`\>
