# Class: MFAManager

Two-factor authentication for user accounts: authenticator apps (TOTP), recovery codes
and the tickets sensitive account actions need. Available as `client.auth.mfa`.

## Example

```ts
// Set up an authenticator app
const ticket = await client.auth.mfa.createTicket({ password });
const { uri } = await client.auth.mfa.generateTotpSecret(ticket);
showQrCode(uri);
await client.auth.mfa.enableTotp(await askForCode());
```

## Constructors

### Constructor

> **new MFAManager**(`client`): `MFAManager`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | The client this manager belongs to. |

#### Returns

`MFAManager`

## Methods

### createTicket()

> **createTicket**(`response`): `Promise`\<[`MFATicket`](../interfaces/MFATicket.md)\>

Creates a ticket for a sensitive account action by confirming the user's identity.
Use a TOTP or recovery code if the account has MFA, otherwise the password.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `response` | [`MFAResponse`](../type-aliases/MFAResponse.md) | The password, TOTP code or recovery code. |

#### Returns

`Promise`\<[`MFATicket`](../interfaces/MFATicket.md)\>

The ticket. It can be used once.

#### Example

```ts
const ticket = await client.auth.mfa.createTicket({ totpCode: "123456" });
await client.auth.mfa.disableTotp(ticket);
```

***

### disableTotp()

> **disableTotp**(`ticket`): `Promise`\<`void`\>

Turns TOTP off.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ticket` | [`MFATicketResolvable`](../type-aliases/MFATicketResolvable.md) | A ticket from [createTicket](#createticket). |

#### Returns

`Promise`\<`void`\>

***

### enableTotp()

> **enableTotp**(`totpCode`): `Promise`\<`void`\>

Turns TOTP on, after [generateTotpSecret](#generatetotpsecret), using a code from the authenticator app.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `totpCode` | `string` | The current 6-digit code. |

#### Returns

`Promise`\<`void`\>

***

### fetchMethods()

> **fetchMethods**(): `Promise`\<(`"Password"` \| `"Recovery"` \| `"Totp"`)[]\>

Fetches which second factors [createTicket](#createticket) accepts for this account.
Accounts without MFA only accept `"Password"`.

#### Returns

`Promise`\<(`"Password"` \| `"Recovery"` \| `"Totp"`)[]\>

The accepted methods.

***

### fetchRecoveryCodes()

> **fetchRecoveryCodes**(`ticket`): `Promise`\<`string`[]\>

Fetches the account's existing recovery codes.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ticket` | [`MFATicketResolvable`](../type-aliases/MFATicketResolvable.md) | A ticket from [createTicket](#createticket). |

#### Returns

`Promise`\<`string`[]\>

The recovery codes.

***

### fetchStatus()

> **fetchStatus**(): `Promise`\<[`MFAStatus`](../interfaces/MFAStatus.md)\>

Fetches which second factors the account has set up.

#### Returns

`Promise`\<[`MFAStatus`](../interfaces/MFAStatus.md)\>

Whether TOTP and recovery codes are active.

***

### generateRecoveryCodes()

> **generateRecoveryCodes**(`ticket`): `Promise`\<`string`[]\>

Generates new recovery codes. The old ones stop working.
Have the user save the new codes: they're the only way back in if they lose their authenticator app.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ticket` | [`MFATicketResolvable`](../type-aliases/MFATicketResolvable.md) | A ticket from [createTicket](#createticket). |

#### Returns

`Promise`\<`string`[]\>

The new recovery codes.

***

### generateTotpSecret()

> **generateTotpSecret**(`ticket`, `options?`): `Promise`\<[`TotpSecret`](../interfaces/TotpSecret.md)\>

Generates a secret for a new authenticator app. TOTP isn't on until [enableTotp](#enabletotp)
is called with a code from the app.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ticket` | [`MFATicketResolvable`](../type-aliases/MFATicketResolvable.md) | A ticket from [createTicket](#createticket). |
| `options` | \{ `accountName?`: `string`; `issuer?`: `string`; \} | The names shown in the authenticator app. |
| `options.accountName?` | `string` | The account label, e.g. the user's email. Defaults to the username. |
| `options.issuer?` | `string` | The service name. Defaults to `"Stoat"`. |

#### Returns

`Promise`\<[`TotpSecret`](../interfaces/TotpSecret.md)\>

The secret and an `otpauth://` URI for a QR code.
