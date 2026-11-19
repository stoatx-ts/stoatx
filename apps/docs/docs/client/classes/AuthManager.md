# Class: AuthManager

Account sessions, logout and onboarding for user accounts. Bots don't need any of this.

## Constructors

### Constructor

> **new AuthManager**(`client`): `AuthManager`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | The client this manager belongs to. |

#### Returns

`AuthManager`

## Methods

### completeOnboarding()

> **completeOnboarding**(`username`): `Promise`\<[`User`](User.md)\>

Picks the username for a new account. Afterwards, call `client.login()` again to connect.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `username` | `string` | 2–32 characters: letters, numbers, `_`, `.` and `-`. |

#### Returns

`Promise`\<[`User`](User.md)\>

The account's user.

***

### createSession()

> **createSession**(`options`): `Promise`\<[`CreateSessionResult`](../type-aliases/CreateSessionResult.md)\>

Creates a user session from an email and password, or finishes an MFA login.
This does not connect the client: use [Client.loginWithCredentials](Client.md#loginwithcredentials) for that,
or pass the returned session to `client.login()`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CredentialLoginOptions`](../type-aliases/CredentialLoginOptions.md) | The email and password, or the MFA ticket and response. |

#### Returns

`Promise`\<[`CreateSessionResult`](../type-aliases/CreateSessionResult.md)\>

The session, an MFA challenge, or a notice that the account is disabled.

#### Example

```ts
let result = await client.auth.createSession({ email, password });
if (result.result === "MFA") {
  result = await client.auth.createSession({ mfaTicket: result.ticket, mfaResponse: { totpCode: "123456" } });
}
```

***

### fetchSessions()

> **fetchSessions**(): `Promise`\<[`SessionInfo`](../interfaces/SessionInfo.md)[]\>

Lists every session logged in to this account.

#### Returns

`Promise`\<[`SessionInfo`](../interfaces/SessionInfo.md)[]\>

Each session's ID and friendly name.

***

### logout()

> **logout**(): `Promise`\<`void`\>

Ends the current user session on the server, disconnects and clears the token.
Emits `logout`.

#### Returns

`Promise`\<`void`\>

***

### needsOnboarding()

> **needsOnboarding**(): `Promise`\<`boolean`\>

Checks whether this account still has to pick a username.

#### Returns

`Promise`\<`boolean`\>

`true` if [completeOnboarding](#completeonboarding) must be called before the account can connect.

***

### renameSession()

> **renameSession**(`id`, `name`): `Promise`\<[`SessionInfo`](../interfaces/SessionInfo.md)\>

Renames a session.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | The session ID. |
| `name` | `string` | The new friendly name. |

#### Returns

`Promise`\<[`SessionInfo`](../interfaces/SessionInfo.md)\>

The updated session.

***

### revokeAllSessions()

> **revokeAllSessions**(`options?`): `Promise`\<`void`\>

Logs out every other session on this account.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | \{ `includeCurrent?`: `boolean`; \} | Set `includeCurrent` to also end this session; the client then disconnects and emits `logout`. |
| `options.includeCurrent?` | `boolean` | - |

#### Returns

`Promise`\<`void`\>

***

### revokeSession()

> **revokeSession**(`id`): `Promise`\<`void`\>

Logs out a session, e.g. another device. Use [logout](#logout) for the current session.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | The session ID. |

#### Returns

`Promise`\<`void`\>
