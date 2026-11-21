# Interface: MessageSearchOptions

Options for [MessageManager.search](../classes/MessageManager.md#search). Pass `query` or `pinned`, not both.

## Properties

### after?

> `optional` **after?**: [`MessageResolvable`](../type-aliases/MessageResolvable.md)

Only find messages sent after this message.

***

### before?

> `optional` **before?**: [`MessageResolvable`](../type-aliases/MessageResolvable.md)

Only find messages sent before this message.

***

### includeUsers?

> `optional` **includeUsers?**: `boolean`

Also fetch and cache the authors (and, in servers, their members).

***

### limit?

> `optional` **limit?**: `number`

How many messages to return, 1–100.

***

### pinned?

> `optional` **pinned?**: `boolean`

Only find pinned messages. Can't be combined with `query`.

***

### query?

> `optional` **query?**: `string`

Text to search for, 1–64 characters.

***

### sort?

> `optional` **sort?**: `"Relevance"` \| `"Latest"` \| `"Oldest"`

How to sort the results. Defaults to `"Relevance"`.
