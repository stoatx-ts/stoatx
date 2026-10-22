# Class: EmbedBuilder

## Constructors

### Constructor

> **new EmbedBuilder**(`data?`): `EmbedBuilder`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | `Partial`\<[`TextEmbedData`](../interfaces/TextEmbedData.md)\> |

#### Returns

`EmbedBuilder`

## Methods

### setColor()

> **setColor**(`color`): `this`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `color` | `string` |

#### Returns

`this`

***

### setDescription()

> **setDescription**(`description`): `this`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `description` | `string` |

#### Returns

`this`

***

### setIconUrl()

> **setIconUrl**(`iconUrl`): `this`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `iconUrl` | `string` |

#### Returns

`this`

***

### setMedia()

> **setMedia**(`fileId`): `this`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fileId` | `string` |

#### Returns

`this`

***

### setTitle()

> **setTitle**(`title`): `this`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `title` | `string` |

#### Returns

`this`

***

### setUrl()

> **setUrl**(`url`): `this`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `url` | `string` |

#### Returns

`this`

***

### toJSON()

> **toJSON**(): [`TextEmbedData`](../interfaces/TextEmbedData.md)

Serializes the builder into the raw JSON required by the API

#### Returns

[`TextEmbedData`](../interfaces/TextEmbedData.md)
