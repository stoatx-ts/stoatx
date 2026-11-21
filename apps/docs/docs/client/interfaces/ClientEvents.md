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

### settingsUpdate

> **settingsUpdate**: \[[`Collection`](../classes/Collection.md)\<`string`, [`SyncedSetting`](SyncedSetting.md)\>\]

Synced settings changed on another device (user sessions only). Only the changed keys are included.

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

### voiceCallUpdate

> **voiceCallUpdate**: \[[`VoiceCallUpdate`](VoiceCallUpdate.md)\]

A call in a DM or group started, or ended.

***

### voiceChannelJoin

> **voiceChannelJoin**: \[[`VoiceState`](../classes/VoiceState.md)\]

Someone joined a voice call.

***

### voiceChannelLeave

> **voiceChannelLeave**: \[[`VoiceState`](../classes/VoiceState.md) \| \{ `channelId`: `string`; `userId`: `string`; \}\]

Someone left a voice call. Partial if their state wasn't cached.

***

### voiceChannelMove

> **voiceChannelMove**: \[[`VoiceState`](../classes/VoiceState.md), `string`\]

Someone moved from one call to another.

***

### voiceMoveRequest

> **voiceMoveRequest**: \[[`VoiceMoveRequest`](VoiceMoveRequest.md)\]

The server moved the logged-in user to another call, e.g. a moderator dragged them.
A voice package needs to reconnect to `toChannelId` with the given `token` and `node`.

***

### voiceStateUpdate

> **voiceStateUpdate**: \[[`VoiceState`](../classes/VoiceState.md), [`VoiceState`](../classes/VoiceState.md)\]

Someone in a call muted, deafened, or turned screen sharing or their camera on or off.

***

### webhookCreate

> **webhookCreate**: \[[`Webhook`](../classes/Webhook.md)\]

***

### webhookDelete

> **webhookDelete**: \[[`Webhook`](../classes/Webhook.md) \| \{ `channelId`: `string`; `id`: `string`; \}\]

***

### webhookUpdate

> **webhookUpdate**: \[[`Webhook`](../classes/Webhook.md), [`Webhook`](../classes/Webhook.md)\]
