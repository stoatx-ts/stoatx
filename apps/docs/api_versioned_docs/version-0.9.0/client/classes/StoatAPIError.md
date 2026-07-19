# Class: StoatAPIError

Custom Error class for Stoat API failures

## Extends

- `Error`

## Constructors

### Constructor

> **new StoatAPIError**(`statusCode`, `data`, `method?`, `path?`): `StoatAPIError`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `statusCode` | `number` |
| `data` | `any` |
| `method?` | `string` |
| `path?` | `string` |

#### Returns

`StoatAPIError`

#### Overrides

`Error.constructor`

## Properties

### apiType

> **apiType**: `string`

***

### location

> **location**: `string`

***

### method?

> `optional` **method?**: `string`

***

### path?

> `optional` **path?**: `string`

***

### rawData

> **rawData**: `any`

***

### statusCode

> **statusCode**: `number`
