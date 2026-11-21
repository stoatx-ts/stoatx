# Interface: LoginOptions

How to log in with [Client.login](../classes/Client.md#login). A [UserSession](UserSession.md) works as-is.

## Properties

### token

> **token**: `string`

The bot token or user session token.

***

### type?

> `optional` **type?**: [`TokenType`](../type-aliases/TokenType.md)

Whether `token` is a bot token or a user session token. Defaults to `"bot"`.
