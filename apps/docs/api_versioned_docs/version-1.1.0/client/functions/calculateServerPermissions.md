# Function: calculateServerPermissions()

> **calculateServerPermissions**(`member`): `bigint`

A member's permissions in their server, before any channel overrides: the server's default
permissions, then each role's override, lowest role first. The owner has every permission;
a timed-out member keeps only [ALLOW\_IN\_TIMEOUT](../variables/ALLOW_IN_TIMEOUT.md).

## Parameters

| Parameter | Type |
| ------ | ------ |
| `member` | [`Member`](../classes/Member.md) |

## Returns

`bigint`
