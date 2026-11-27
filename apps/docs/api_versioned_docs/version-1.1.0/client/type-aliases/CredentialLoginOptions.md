# Type Alias: CredentialLoginOptions

> **CredentialLoginOptions** = \{ `email`: `string`; `friendlyName?`: `string`; `password`: `string`; \} \| \{ `friendlyName?`: `string`; `mfaResponse?`: [`MFAResponse`](MFAResponse.md); `mfaTicket`: `string`; \}

Credentials for [Client.loginWithCredentials](../classes/Client.md#loginwithcredentials) and [AuthManager.createSession](../classes/AuthManager.md#createsession).

## Union Members

### Type Literal

\{ `email`: `string`; `friendlyName?`: `string`; `password`: `string`; \}

| Name | Type | Description |
| ------ | ------ | ------ |
| `email` | `string` | - |
| `friendlyName?` | `string` | Name shown in the account's session list, e.g. "Firefox on Linux". |
| `password` | `string` | - |

***

### Type Literal

\{ `friendlyName?`: `string`; `mfaResponse?`: [`MFAResponse`](MFAResponse.md); `mfaTicket`: `string`; \}

| Name | Type | Description |
| ------ | ------ | ------ |
| `friendlyName?` | `string` | Name shown in the account's session list, e.g. "Firefox on Linux". |
| `mfaResponse?` | [`MFAResponse`](MFAResponse.md) | The second factor. Not needed for the ticket from [AuthManager.verifyEmail](../classes/AuthManager.md#verifyemail). |
| `mfaTicket` | `string` | The ticket from an `MFA` login result, or the ticket from [AuthManager.verifyEmail](../classes/AuthManager.md#verifyemail). |
