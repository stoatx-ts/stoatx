# Interface: MFATicket

A ticket proving the user just confirmed their identity. Sensitive account actions,
like disabling TOTP or deleting the account, need one. Get it from [MFAManager.createTicket](../classes/MFAManager.md#createticket).

A ticket can only be used once and expires after a few minutes, so create a new one for each action.

## Properties

### accountId

> **accountId**: `string`

The ID of the account the ticket belongs to.

***

### authorised

> **authorised**: `boolean`

Whether the ticket can be used to log in.

***

### id

> **id**: `string`

The ticket ID.

***

### token

> **token**: `string`

The ticket token, sent with the request it authorises.

***

### validated

> **validated**: `boolean`

Whether the ticket can be used for account actions.
