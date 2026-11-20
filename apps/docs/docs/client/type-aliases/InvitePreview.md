# Type Alias: InvitePreview

> **InvitePreview** = \{ `channelDescription`: `string` \| `null`; `channelId`: `string`; `channelName`: `string`; `code`: `string`; `inviterAvatar`: [`Attachment`](../classes/Attachment.md) \| `null`; `inviterName`: `string`; `memberCount`: `number`; `serverBanner`: [`Attachment`](../classes/Attachment.md) \| `null`; `serverFlags`: `number` \| `null`; `serverIcon`: [`Attachment`](../classes/Attachment.md) \| `null`; `serverId`: `string`; `serverName`: `string`; `type`: `"Server"`; \} \| \{ `channelDescription`: `string` \| `null`; `channelId`: `string`; `channelName`: `string`; `code`: `string`; `inviterAvatar`: [`Attachment`](../classes/Attachment.md) \| `null`; `inviterName`: `string`; `type`: `"Group"`; \}

What an invite leads to, shown before joining. Fetched with [InviteManager.fetch](../classes/InviteManager.md#fetch).

## Union Members

### Type Literal

\{ `channelDescription`: `string` \| `null`; `channelId`: `string`; `channelName`: `string`; `code`: `string`; `inviterAvatar`: [`Attachment`](../classes/Attachment.md) \| `null`; `inviterName`: `string`; `memberCount`: `number`; `serverBanner`: [`Attachment`](../classes/Attachment.md) \| `null`; `serverFlags`: `number` \| `null`; `serverIcon`: [`Attachment`](../classes/Attachment.md) \| `null`; `serverId`: `string`; `serverName`: `string`; `type`: `"Server"`; \}

| Name | Type | Description |
| ------ | ------ | ------ |
| `channelDescription` | `string` \| `null` | - |
| `channelId` | `string` | The channel the invite opens on. |
| `channelName` | `string` | - |
| `code` | `string` | - |
| `inviterAvatar` | [`Attachment`](../classes/Attachment.md) \| `null` | - |
| `inviterName` | `string` | Name of the user who created the invite. |
| `memberCount` | `number` | - |
| `serverBanner` | [`Attachment`](../classes/Attachment.md) \| `null` | - |
| `serverFlags` | `number` \| `null` | - |
| `serverIcon` | [`Attachment`](../classes/Attachment.md) \| `null` | - |
| `serverId` | `string` | - |
| `serverName` | `string` | - |
| `type` | `"Server"` | - |

***

### Type Literal

\{ `channelDescription`: `string` \| `null`; `channelId`: `string`; `channelName`: `string`; `code`: `string`; `inviterAvatar`: [`Attachment`](../classes/Attachment.md) \| `null`; `inviterName`: `string`; `type`: `"Group"`; \}

| Name | Type | Description |
| ------ | ------ | ------ |
| `channelDescription` | `string` \| `null` | - |
| `channelId` | `string` | - |
| `channelName` | `string` | - |
| `code` | `string` | - |
| `inviterAvatar` | [`Attachment`](../classes/Attachment.md) \| `null` | - |
| `inviterName` | `string` | Name of the user who created the invite. |
| `type` | `"Group"` | - |
