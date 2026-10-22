# Class: Webhook

The base class for all structures.

## Extends

- [`Base`](Base.md)

## Constructors

### Constructor

> **new Webhook**(`client`, `data`): `Webhook`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `data` | \{ \} |

#### Returns

`Webhook`

#### Overrides

[`Base`](Base.md).[`constructor`](Base.md#constructor)

## Properties

### avatar

> **avatar**: [`Attachment`](Attachment.md) \| `null`

***

### cachedAt

> **cachedAt**: `number`

#### Inherited from

[`Base`](Base.md).[`cachedAt`](Base.md#cachedat)

***

### channelId

> **channelId**: `string`

***

### client

> `protected` `readonly` **client**: [`Client`](Client.md)

#### Inherited from

[`Base`](Base.md).[`client`](Base.md#client)

***

### creatorId

> **creatorId**: `string`

***

### id

> `readonly` **id**: `string`

#### Inherited from

[`Base`](Base.md).[`id`](Base.md#id)

***

### name

> **name**: `string`

***

### permissions

> **permissions**: `bigint`

***

### token

> **token**: `string` \| `null`

## Methods

### \_clone()

> **\_clone**(): `this`

Helper to quickly clone a structure

#### Returns

`this`

#### Inherited from

[`Base`](Base.md).[`_clone`](Base.md#_clone)

***

### avatarURL()

> **avatarURL**(): `string` \| `null`

#### Returns

`string` \| `null`

***

### delete()

> **delete**(): `Promise`\<`void`\>

Delete this webhook.

#### Returns

`Promise`\<`void`\>

***

### edit()

> **edit**(`data`): `Promise`\<`Webhook`\>

Edit this webhook's name/avatar (bot auth).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | [`WebhookEditOptions`](../interfaces/WebhookEditOptions.md) |

#### Returns

`Promise`\<`Webhook`\>

***

### equals()

> **equals**(`other`): `boolean`

Compares this object with another to see if they represent the same entity.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | `string` \| [`Base`](Base.md) |

#### Returns

`boolean`

#### Inherited from

[`Base`](Base.md).[`equals`](Base.md#equals)

***

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`Base`](Base.md).[`toString`](Base.md#tostring)
