# Interface: ClientOptions

## Properties

### apiURL?

> `optional` **apiURL?**: `string`

***

### cacheLimits?

> `optional` **cacheLimits?**: `object`

#### channels?

> `optional` **channels?**: `number`

#### emojis?

> `optional` **emojis?**: `number`

#### servers?

> `optional` **servers?**: `number`

#### users?

> `optional` **users?**: `number`

***

### overrides?

> `optional` **overrides?**: `object`

#### cdnURL?

> `optional` **cdnURL?**: `string`

#### wsURL?

> `optional` **wsURL?**: `string`

***

### partials?

> `optional` **partials?**: `object`

Emit events for data that is not in the cache, using partial structures.
Partial structures have `partial: true` and only contain the fields the event carried.

#### messages?

> `optional` **messages?**: `boolean`

Emit `messageUpdate` for uncached messages with a partial `Message` (old value is `null`).

***

### sweepers?

> `optional` **sweepers?**: [`SweeperOptions`](SweeperOptions.md)
