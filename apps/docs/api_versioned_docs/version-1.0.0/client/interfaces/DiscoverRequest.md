# Interface: DiscoverRequest

Where a Discover listing request is. Discover only does something on instances that run it
(such as stoat.chat); elsewhere requests are stored but nobody reviews them.

## Properties

### id

> **id**: `string`

The bot's or server's ID.

***

### reason

> **reason**: `string` \| `null`

Why it was approved, denied or removed, if the reviewers gave a reason.

***

### status

> **status**: `"Pending"` \| `"UnderReview"` \| `"Approved"` \| `"Denied"` \| `"Removed"`

Waiting in the queue, being reviewed, or decided.

***

### type

> **type**: `"Server"` \| `"Bot"`

Whether it's for a bot or a server.
