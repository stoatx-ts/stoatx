# Class: InviteManager

Previews and accepts invites by code. To list or create a server's invites, use `server.invites`.

## Constructors

### Constructor

> **new InviteManager**(`client`): `InviteManager`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | The client this manager belongs to. |

#### Returns

`InviteManager`

## Methods

### accept()

> **accept**(`code`): `Promise`\<[`Server`](Server.md) \| [`GroupChannel`](GroupChannel.md)\>

Joins the server or group an invite is for (user sessions only; bots can't accept invites).
The server or group is cached straight away, so it's usable as soon as this resolves.
A discoverable server can also be joined by passing its ID as the code.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `code` | `string` | The invite code. |

#### Returns

`Promise`\<[`Server`](Server.md) \| [`GroupChannel`](GroupChannel.md)\>

The joined server, or the joined group channel.

#### Throws

`NotFound` if the invite doesn't exist, `IsBot` for bots, `Banned` if you're
banned from the server, or `TooManyServers` if you're at the server limit.

***

### fetch()

> **fetch**(`code`): `Promise`\<[`InvitePreview`](../type-aliases/InvitePreview.md)\>

Shows what an invite leads to without joining. Works without logging in.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `code` | `string` | The invite code, e.g. from `https://stt.gg/abc123`. |

#### Returns

`Promise`\<[`InvitePreview`](../type-aliases/InvitePreview.md)\>

The server or group the invite is for.

#### Throws

`NotFound` if the invite doesn't exist or has expired.
