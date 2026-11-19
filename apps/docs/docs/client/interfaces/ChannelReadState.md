# Interface: ChannelReadState

What the logged-in user has read in one channel.

## Properties

### channelId

> **channelId**: `string`

The channel this state belongs to.

***

### lastReadId

> **lastReadId**: `string` \| `null`

The last message the user has read, or `null` if they've never opened the channel.

***

### mentionIds

> **mentionIds**: `Set`\<`string`\>

Unread messages that mention the user.
