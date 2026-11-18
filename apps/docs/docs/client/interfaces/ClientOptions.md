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
Partial structures have `partial` set to true and only contain the fields the event carried;
call `fetch()` on them to fill in the rest.

#### messages?

> `optional` **messages?**: `boolean`

Emit `messageUpdate` for uncached messages in cached channels, using partial messages.

***

### sweepers?

> `optional` **sweepers?**: [`SweeperOptions`](SweeperOptions.md)
