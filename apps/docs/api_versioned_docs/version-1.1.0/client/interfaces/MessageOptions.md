# Interface: MessageOptions

## Properties

### attachments?

> `optional` **attachments?**: `string`[] \| [`AttachmentBuilder`](../classes/AttachmentBuilder.md)[]

***

### content?

> `optional` **content?**: `string`

***

### embeds?

> `optional` **embeds?**: ([`TextEmbedData`](TextEmbedData.md) \| [`EmbedBuilder`](../classes/EmbedBuilder.md))[] \| `null`

Embeds to send. When editing, `null` (or `[]`) removes the message's embeds.

***

### flags?

> `optional` **flags?**: `number`

***

### interactions?

> `optional` **interactions?**: `object`

#### reactions?

> `optional` **reactions?**: `string`[] \| `null`

#### restrict\_reactions?

> `optional` **restrict\_reactions?**: `boolean`

***

### masquerade?

> `optional` **masquerade?**: [`Masquerade`](Masquerade.md)

***

### replies?

> `optional` **replies?**: [`ReplyIntent`](ReplyIntent.md)[]
