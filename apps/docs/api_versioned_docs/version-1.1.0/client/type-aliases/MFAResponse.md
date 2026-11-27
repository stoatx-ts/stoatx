# Type Alias: MFAResponse

> **MFAResponse** = \{ `password`: `string`; \} \| \{ `recoveryCode`: `string`; \} \| \{ `totpCode`: `string`; \}

The second factor sent to finish an MFA login. Provide exactly one.
