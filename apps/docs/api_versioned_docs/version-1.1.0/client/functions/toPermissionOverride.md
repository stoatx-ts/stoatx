# Function: toPermissionOverride()

> **toPermissionOverride**(`raw`): [`PermissionOverride`](../interfaces/PermissionOverride.md)

Turns the API's `{ a, d }` override into a [PermissionOverride](../interfaces/PermissionOverride.md). Missing means no change.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `raw` | \{ `a`: `number`; `d`: `number`; \} \| `null` \| `undefined` |

## Returns

[`PermissionOverride`](../interfaces/PermissionOverride.md)
