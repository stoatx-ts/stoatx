# Interface: Patchable\<RawData\>

Minimal contract for structures that support in-place patching.
Patch payloads are usually partial (gateway updates rarely send every field).

## Type Parameters

| Type Parameter |
| ------ |
| `RawData` |

## Methods

### \_patch()

> **\_patch**(`data`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Partial`\<`RawData`\> |

#### Returns

`void`
