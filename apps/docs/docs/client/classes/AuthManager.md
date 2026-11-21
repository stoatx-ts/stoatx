# Class: AuthManager

Accounts, sessions, logout and onboarding for user accounts. Bots don't need any of this.

## Constructors

### Constructor

> **new AuthManager**(`client`): `AuthManager`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | The client this manager belongs to. |

#### Returns

`AuthManager`

## Properties

### mfa

> `readonly` **mfa**: [`MFAManager`](MFAManager.md)

Two-factor authentication: TOTP, recovery codes and MFA tickets.

***

### policyChanges

> **policyChanges**: [`PendingPolicyChange`](../interfaces/PendingPolicyChange.md)[] = `[]`

Policy changes the user hasn't acknowledged yet, loaded when the client connects.
Show them to the user, then call [acknowledgePolicyChanges](#acknowledgepolicychanges). Always empty for bots.

## Methods

### acknowledgePolicyChanges()

> **acknowledgePolicyChanges**(): `Promise`\<`void`\>

Acknowledges every pending policy change and empties [policyChanges](#policychanges).

#### Returns

`Promise`\<`void`\>

#### Example

```ts
client.on("ready", () => {
  if (client.auth.policyChanges.length > 0) showPolicyNotice(client.auth.policyChanges);
});
// When the user clicks "OK":
await client.auth.acknowledgePolicyChanges();
```

***

### changeEmail()

> **changeEmail**(`currentPassword`, `newEmail`): `Promise`\<`void`\>

Changes the account's email address. Stoat emails a verification link to the new address,
and the change applies once it's verified with [verifyEmail](#verifyemail).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `currentPassword` | `string` | The current password. |
| `newEmail` | `string` | The new email address. |

#### Returns

`Promise`\<`void`\>

***

### changePassword()

> **changePassword**(`currentPassword`, `newPassword`): `Promise`\<`void`\>

Changes the account's password.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `currentPassword` | `string` | The current password. |
| `newPassword` | `string` | The new password. |

#### Returns

`Promise`\<`void`\>

***

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

### confirmAccountDeletion()

> **confirmAccountDeletion**(`token`): `Promise`\<`void`\>

Confirms an account deletion with the token from the confirmation email. Works without logging in.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `token` | `string` | The token from the link. |

#### Returns

`Promise`\<`void`\>

***

### createAccount()

> **createAccount**(`options`): `Promise`\<`void`\>

Creates an account. Stoat then emails a verification link; the account can log in once
it's verified with [verifyEmail](#verifyemail). Works without logging in.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CreateAccountOptions`](../interfaces/CreateAccountOptions.md) | The email, password and, if the instance needs them, an invite code and captcha. |

#### Returns

`Promise`\<`void`\>

#### Example

```ts
await client.auth.createAccount({ email, password });
showMessage("Check your inbox to verify your email.");
```

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

### deleteAccount()

> **deleteAccount**(`ticket`): `Promise`\<`void`\>

Requests the account's deletion. Stoat emails a confirmation link; nothing is deleted until
it's confirmed with [confirmAccountDeletion](#confirmaccountdeletion).

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ticket` | [`MFATicketResolvable`](../type-aliases/MFATicketResolvable.md) | A ticket from [MFAManager.createTicket](MFAManager.md#createticket). |

#### Returns

`Promise`\<`void`\>

***

### disableAccount()

> **disableAccount**(`ticket`): `Promise`\<`void`\>

Disables the account. Every session is logged out, including this one, so the client
disconnects and emits `logout`. Only Stoat's staff can enable it again.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ticket` | [`MFATicketResolvable`](../type-aliases/MFATicketResolvable.md) | A ticket from [MFAManager.createTicket](MFAManager.md#createticket). |

#### Returns

`Promise`\<`void`\>

***

### fetchAccount()

> **fetchAccount**(): `Promise`\<[`AccountInfo`](../interfaces/AccountInfo.md)\>

Fetches the logged-in account's ID and email address.

#### Returns

`Promise`\<[`AccountInfo`](../interfaces/AccountInfo.md)\>

The account.

***

### fetchSessions()

> **fetchSessions**(): `Promise`\<[`SessionInfo`](../interfaces/SessionInfo.md)[]\>

Lists every session logged in to this account.

#### Returns

`Promise`\<[`SessionInfo`](../interfaces/SessionInfo.md)[]\>

Each session's ID and friendly name.

***

### fetchVapidKey()

> **fetchVapidKey**(): `Promise`\<`string` \| `null`\>

Fetches the instance's VAPID public key, needed to create a Web Push subscription in the browser.

#### Returns

`Promise`\<`string` \| `null`\>

The key, base64url-encoded, or `null` if the instance doesn't support push notifications.

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

### resendVerification()

> **resendVerification**(`email`, `options?`): `Promise`\<`void`\>

Sends the verification email again. Works without logging in.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `email` | `string` | The account's email address. |
| `options` | \{ `captcha?`: `string`; \} | Optional extra parameters for the request. |
| `options.captcha?` | `string` | A captcha response, for instances that require one. |

#### Returns

`Promise`\<`void`\>

***

### resetPassword()

> **resetPassword**(`token`, `password`, `options?`): `Promise`\<`void`\>

Sets a new password with the token from the reset link. Works without logging in.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `token` | `string` | The token from the link. |
| `password` | `string` | The new password. |
| `options` | \{ `logoutAllSessions?`: `boolean`; \} | Optional extra parameters for the request. |
| `options.logoutAllSessions?` | `boolean` | Also log out every session on the account. |

#### Returns

`Promise`\<`void`\>

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

***

### sendPasswordReset()

> **sendPasswordReset**(`email`, `options?`): `Promise`\<`void`\>

Emails a password reset link. Works without logging in.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `email` | `string` | The account's email address. |
| `options` | \{ `captcha?`: `string`; \} | Optional extra parameters for the request. |
| `options.captcha?` | `string` | A captcha response, for instances that require one. |

#### Returns

`Promise`\<`void`\>

***

### subscribePush()

> **subscribePush**(`subscription`): `Promise`\<`void`\>

Sends push notifications for this session to a Web Push subscription.
A session has at most one subscription, so this replaces any earlier one.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `subscription` | [`PushSubscriptionKeys`](../interfaces/PushSubscriptionKeys.md) \| [`PushSubscriptionLike`](../interfaces/PushSubscriptionLike.md) | A browser `PushSubscription`, or its endpoint and keys. |

#### Returns

`Promise`\<`void`\>

#### Example

```ts
const registration = await navigator.serviceWorker.ready;
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: await client.auth.fetchVapidKey(),
});
await client.auth.subscribePush(subscription);
```

***

### unsubscribePush()

> **unsubscribePush**(): `Promise`\<`void`\>

Stops push notifications for this session.

#### Returns

`Promise`\<`void`\>

***

### verifyEmail()

> **verifyEmail**(`code`): `Promise`\<[`MFATicket`](../interfaces/MFATicket.md) \| `null`\>

Verifies an email address with the code from the verification link. Works without logging in.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `code` | `string` | The code from the link. |

#### Returns

`Promise`\<[`MFATicket`](../interfaces/MFATicket.md) \| `null`\>

For a new account, a ticket that logs it in without the password:
`client.loginWithCredentials({ mfaTicket: ticket.token })`. `null` after an email change.
