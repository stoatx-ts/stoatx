# Interface: InviteCreateOptions

Options for creating an invite with `channel.createInvite()`.

## Properties

### expiresAt?

> `optional` **expiresAt?**: `Date`

When the invite stops working. Must be in the future, and within the instance's limit
(`InvalidOperation` otherwise). Never expires by default.

***

### maxUses?

> `optional` **maxUses?**: `number`

How many times the invite can be used, 1–100. Unlimited by default.
