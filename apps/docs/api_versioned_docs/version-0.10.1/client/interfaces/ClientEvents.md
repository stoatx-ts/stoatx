# Interface: ClientEvents

## Properties

### channelCreate

> **channelCreate**: \[[`BaseChannel`](../classes/BaseChannel.md)\]

***

### channelDelete

> **channelDelete**: \[`string` \| [`BaseChannel`](../classes/BaseChannel.md)\]

***

### channelUpdate

> **channelUpdate**: \[[`BaseChannel`](../classes/BaseChannel.md) \| `null`, [`BaseChannel`](../classes/BaseChannel.md)\]

***

### debug

> **debug**: \[`string`\]

***

### error

> **error**: \[`Error`\]

***

### messageCreate

> **messageCreate**: \[[`Message`](../classes/Message.md)\]

***

### messageDelete

> **messageDelete**: \[[`Message`](../classes/Message.md) \| \{ `channelId`: `string`; `id`: `string`; \}\]

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

> **messageUpdate**: \[[`Message`](../classes/Message.md) \| `null`, [`Message`](../classes/Message.md)\]

***

### raw

> **raw**: \[`any`\]

***

### ready

> **ready**: \[`any`\]

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

### serverUpdate

> **serverUpdate**: \[[`Server`](../classes/Server.md) \| `null`, [`Server`](../classes/Server.md)\]

***

### userUpdate

> **userUpdate**: \[[`User`](../classes/User.md), [`User`](../classes/User.md)\]
