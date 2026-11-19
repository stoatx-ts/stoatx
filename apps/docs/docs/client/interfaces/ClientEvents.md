# Interface: ClientEvents

## Properties

### channelAck

> **channelAck**: \[`string`, `string`, `string`\]

***

### channelCreate

> **channelCreate**: \[[`BaseChannel`](../classes/BaseChannel.md)\]

***

### channelDelete

> **channelDelete**: \[`string` \| [`BaseChannel`](../classes/BaseChannel.md)\]

***

### channelGroupJoin

> **channelGroupJoin**: \[[`BaseChannel`](../classes/BaseChannel.md) \| \{ `id`: `string`; \}, `string`\]

***

### channelGroupLeave

> **channelGroupLeave**: \[[`BaseChannel`](../classes/BaseChannel.md) \| \{ `id`: `string`; \}, `string`\]

***

### channelUpdate

> **channelUpdate**: \[[`BaseChannel`](../classes/BaseChannel.md), [`BaseChannel`](../classes/BaseChannel.md)\]

***

### debug

> **debug**: \[`string`\]

***

### emojiCreate

> **emojiCreate**: \[[`Emoji`](../classes/Emoji.md)\]

***

### emojiDelete

> **emojiDelete**: \[`string` \| [`Emoji`](../classes/Emoji.md)\]

***

### emojiUpdate

> **emojiUpdate**: \[[`Emoji`](../classes/Emoji.md), [`Emoji`](../classes/Emoji.md)\]

***

### error

> **error**: \[`Error`\]

***

### logout

> **logout**: \[\]

The session ended: logged out, revoked from another device, or the token was invalidated. The client has disconnected.

***

### messageCreate

> **messageCreate**: \[[`Message`](../classes/Message.md)\]

***

### messageDelete

> **messageDelete**: \[[`Message`](../classes/Message.md) \| \{ `channelId`: `string`; `id`: `string`; \}\]

***

### messageDeleteBulk

> **messageDeleteBulk**: \[[`Collection`](../classes/Collection.md)\<`string`, [`Message`](../classes/Message.md) \| \{ `channelId`: `string`; `id`: `string`; \}\>, `string`\]

***

### messageReact

> **messageReact**: \[[`Message`](../classes/Message.md) \| \{ `channelId`: `string`; `id`: `string`; \}, `string`, `string`\]

***

### messageRemoveReaction

> **messageRemoveReaction**: \[[`Message`](../classes/Message.md) \| \{ `channelId`: `string`; `id`: `string`; \}, `string`\]

***

### messageUnreact

> **messageUnreact**: \[[`Message`](../classes/Message.md) \| \{ `channelId`: `string`; `id`: `string`; \}, `string`, `string`\]

***

### messageUpdate

> **messageUpdate**: \[[`Message`](../classes/Message.md), [`Message`](../classes/Message.md)\]

For uncached messages (only with `partials.messages`), both messages are partial.

***

### raw

> **raw**: \[`any`\]

***

### ready

> **ready**: \[[`ReadyData`](ReadyData.md)\]

***

### serverBanAdd

> **serverBanAdd**: \[[`Member`](../classes/Member.md) \| \{ `serverId`: `string`; `userId`: `string`; \}\]

***

### serverCreate

> **serverCreate**: \[[`Server`](../classes/Server.md)\]

***

### serverDelete

> **serverDelete**: \[`string` \| [`Server`](../classes/Server.md)\]

***

### serverMemberJoin

> **serverMemberJoin**: \[[`Member`](../classes/Member.md)\]

***

### serverMemberKick

> **serverMemberKick**: \[[`Member`](../classes/Member.md) \| \{ `serverId`: `string`; `userId`: `string`; \}\]

***

### serverMemberLeave

> **serverMemberLeave**: \[[`Member`](../classes/Member.md) \| \{ `serverId`: `string`; `userId`: `string`; \}\]

***

### serverMemberUpdate

> **serverMemberUpdate**: \[[`Member`](../classes/Member.md), [`Member`](../classes/Member.md)\]

***

### serverRoleCreate

> **serverRoleCreate**: \[[`Role`](../classes/Role.md)\]

***

### serverRoleDelete

> **serverRoleDelete**: \[[`Role`](../classes/Role.md) \| \{ `id`: `string`; `serverId`: `string`; \}\]

***

### serverRoleRanksUpdate

> **serverRoleRanksUpdate**: \[[`Server`](../classes/Server.md)\]

***

### serverRoleUpdate

> **serverRoleUpdate**: \[[`Role`](../classes/Role.md), [`Role`](../classes/Role.md)\]

***

### serverUpdate

> **serverUpdate**: \[[`Server`](../classes/Server.md), [`Server`](../classes/Server.md)\]

***

### typingStart

> **typingStart**: \[`string`, `string`\]

***

### typingStop

> **typingStop**: \[`string`, `string`\]

***

### userPlatformWipe

> **userPlatformWipe**: \[`string`, `number`\]

***

### userRelationship

> **userRelationship**: \[[`User`](../classes/User.md)\]

***

### userUpdate

> **userUpdate**: \[[`User`](../classes/User.md), [`User`](../classes/User.md)\]

***

### webhookCreate

> **webhookCreate**: \[[`Webhook`](../classes/Webhook.md)\]

***

### webhookDelete

> **webhookDelete**: \[[`Webhook`](../classes/Webhook.md) \| \{ `channelId`: `string`; `id`: `string`; \}\]

***

### webhookUpdate

> **webhookUpdate**: \[[`Webhook`](../classes/Webhook.md), [`Webhook`](../classes/Webhook.md)\]
