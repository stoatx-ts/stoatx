# Interface: TotpSecret

A new TOTP secret from [MFAManager.generateTotpSecret](../classes/MFAManager.md#generatetotpsecret).

## Properties

### secret

> **secret**: `string`

The base32 secret. Show it to the user, or put it in a QR code.

***

### uri

> **uri**: `string`

An `otpauth://` URI with the secret, ready to be turned into a QR code
that authenticator apps can scan.
