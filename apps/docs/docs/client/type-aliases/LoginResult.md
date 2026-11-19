# Type Alias: LoginResult

> **LoginResult** = [`CreateSessionResult`](CreateSessionResult.md) \| \{ `result`: `"Onboarding"`; `session`: [`UserSession`](../interfaces/UserSession.md); \}

Result of [Client.loginWithCredentials](../classes/Client.md#loginwithcredentials).

## Union Members

[`CreateSessionResult`](CreateSessionResult.md)

***

### Type Literal

\{ `result`: `"Onboarding"`; `session`: [`UserSession`](../interfaces/UserSession.md); \}

The session was created but the account has to pick a username before it can connect.
Call `client.auth.completeOnboarding(username)`, then `client.login(session)`.
