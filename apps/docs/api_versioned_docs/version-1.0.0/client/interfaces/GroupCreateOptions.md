# Interface: GroupCreateOptions

Options for [ChannelManager.createGroup](../classes/ChannelManager.md#creategroup).

## Properties

### description?

> `optional` **description?**: `string`

The group description, up to 1024 characters.

***

### icon?

> `optional` **icon?**: `string` \| [`AttachmentBuilder`](../classes/AttachmentBuilder.md)

The group icon: an uploaded file ID, or an [AttachmentBuilder](../classes/AttachmentBuilder.md) to upload.

***

### name

> **name**: `string`

The group name, 1–32 characters.

***

### nsfw?

> `optional` **nsfw?**: `boolean`

Whether the group is age-restricted.

***

### users?

> `optional` **users?**: [`UserResolvable`](../type-aliases/UserResolvable.md)[]

Friends to add to the group, up to 49.
