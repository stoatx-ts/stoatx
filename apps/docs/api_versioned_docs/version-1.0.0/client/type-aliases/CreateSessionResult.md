# Type Alias: CreateSessionResult

> **CreateSessionResult** = \{ `result`: `"Success"`; `session`: [`UserSession`](../interfaces/UserSession.md); \} \| \{ `allowedMethods`: [`MFAMethod`](MFAMethod.md)[]; `result`: `"MFA"`; `ticket`: `string`; \} \| \{ `result`: `"Disabled"`; `userId`: `string`; \}

Result of creating a session with [AuthManager.createSession](../classes/AuthManager.md#createsession).

## Union Members

### Type Literal

\{ `result`: `"Success"`; `session`: [`UserSession`](../interfaces/UserSession.md); \}

***

### Type Literal

\{ `allowedMethods`: [`MFAMethod`](MFAMethod.md)[]; `result`: `"MFA"`; `ticket`: `string`; \}

The account has MFA on: log in again with `{ mfaTicket: ticket, mfaResponse }`.

***

### Type Literal

\{ `result`: `"Disabled"`; `userId`: `string`; \}

The account is disabled.
