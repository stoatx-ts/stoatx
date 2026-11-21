# Interface: BotEditOptions

Options for [BotManager.edit](../classes/BotManager.md#edit).

## Properties

### analytics?

> `optional` **analytics?**: `boolean`

Whether to collect analytics for the bot. Required to be listed on Discover.

***

### defaultPermissions?

> `optional` **defaultPermissions?**: [`PermissionResolvable`](../type-aliases/PermissionResolvable.md)

The permissions the bot asks for when it's invited to a server.

***

### interactionsUrl?

> `optional` **interactionsUrl?**: `string` \| `null`

Reserved by Stoat for interactions. `null` removes it.

***

### name?

> `optional` **name?**: `string`

The bot's username, 2–32 characters: letters, numbers, `_`, `.` and `-`.

***

### public?

> `optional` **public?**: `boolean`

Whether anyone can invite the bot, not just its owner.

***

### resetToken?

> `optional` **resetToken?**: `boolean`

Generate a new token. The old one stops working.
