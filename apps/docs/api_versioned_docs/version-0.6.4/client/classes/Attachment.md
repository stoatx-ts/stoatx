# Class: Attachment

The base class for all structures.

## Extends

- [`Base`](Base.md)

## Constructors

### Constructor

> **new Attachment**(`client`, `data`): `Attachment`

#### Parameters

| Parameter | Type                  |
| --------- | --------------------- |
| `client`  | [`Client`](Client.md) |
| `data`    | \{ \}                 |

#### Returns

`Attachment`

#### Overrides

[`Base`](Base.md).[`constructor`](Base.md#constructor)

## Properties

### cachedAt

> **cachedAt**: `number`

#### Inherited from

[`Base`](Base.md).[`cachedAt`](Base.md#cachedat)

---

### client

> `protected` `readonly` **client**: [`Client`](Client.md)

#### Inherited from

[`Base`](Base.md).[`client`](Base.md#client)

---

### contentType

> **contentType**: `string`

---

### deleted?

> `optional` **deleted?**: `boolean`

---

### filename

> **filename**: `string`

---

### id

> **id**: `string`

#### Overrides

[`Base`](Base.md).[`id`](Base.md#id)

---

### messageId?

> `optional` **messageId?**: `string` \| `null`

---

### metadata

> **metadata**: [`AttachmentMetadata`](../type-aliases/AttachmentMetadata.md)

---

### objectId?

> `optional` **objectId?**: `string` \| `null`

---

### reported?

> `optional` **reported?**: `boolean`

---

### serverId?

> `optional` **serverId?**: `string` \| `null`

---

### size

> **size**: `number`

---

### tag

> **tag**: `string`

---

### userId?

> `optional` **userId?**: `string` \| `null`

## Accessors

### isImage

#### Get Signature

> **get** **isImage**(): `boolean`

Helper boolean to quickly check if it's an image

##### Returns

`boolean`

---

### url

#### Get Signature

> **get** **url**(): `string`

Automatically constructs the direct CDN URL for this file

##### Returns

`string`

## Methods

### \_clone()

> **\_clone**(): `this`

Helper to quickly clone a structure

#### Returns

`this`

#### Inherited from

[`Base`](Base.md).[`_clone`](Base.md#_clone)

---

### equals()

> **equals**(`other`): `boolean`

Compares this object with another to see if they represent the same entity.

#### Parameters

| Parameter | Type                          |
| --------- | ----------------------------- |
| `other`   | `string` \| [`Base`](Base.md) |

#### Returns

`boolean`

#### Inherited from

[`Base`](Base.md).[`equals`](Base.md#equals)

---

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`Base`](Base.md).[`toString`](Base.md#tostring)
