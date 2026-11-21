# Interface: UserSession

A logged-in user session. Store it to log in again later without a password:
`client.login(session)`.

## Properties

### id

> **id**: `string`

The session ID.

***

### name

> **name**: `string`

The session's friendly name.

***

### token

> **token**: `string`

The session token. Treat it like a password.

***

### type

> `readonly` **type**: `"user"`

Always `"user"`, so the session can be passed straight to `client.login()`.

***

### userId

> **userId**: `string`

The ID of the user the session belongs to.
