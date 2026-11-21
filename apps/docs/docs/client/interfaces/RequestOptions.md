# Interface: RequestOptions

Extra options for a single request.

## Properties

### headers?

> `optional` **headers?**: `Record`\<`string`, `string`\>

Headers sent with this request only, e.g. `X-MFA-Ticket`.

***

### query?

> `optional` **query?**: `Record`\<`string`, `string` \| `number` \| `boolean`\>

Query parameters for this request. When set, `params` are all sent in the body as-is,
instead of moving the ones named like a query parameter into the URL. Use it for
bodies with arbitrary keys, like settings.
