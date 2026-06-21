# Class: Emoji

The base class for all structures.

## Extends

- [`Base`](Base.md)

## Constructors

### Constructor

> **new Emoji**(`client`, `data`): `Emoji`

#### Parameters

| Parameter | Type                  |
| --------- | --------------------- |
| `client`  | [`Client`](Client.md) |
| `data`    | \{ \}                 |

#### Returns

`Emoji`

#### Overrides

[`Base`](Base.md).[`constructor`](Base.md#constructor)

## Properties

### animated

> **animated**: `boolean` = `false`

---

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

### creatorId

> **creatorId**: `string`

---

### id

> `readonly` **id**: `string`

#### Inherited from

[`Base`](Base.md).[`id`](Base.md#id)

---

### name

> **name**: `string`

---

### nsfw

> **nsfw**: `boolean` = `false`

---

### parent

> **parent**: [`EmojiParent`](../type-aliases/EmojiParent.md)

## Methods

### \_clone()

> **\_clone**(): `this`

Helper to quickly clone a structure

#### Returns

`this`

#### Inherited from

[`Base`](Base.md).[`_clone`](Base.md#_clone)

---

### \_patch()

> **\_patch**(`data`): `void`

#### Parameters

| Parameter | Type  |
| --------- | ----- |
| `data`    | \{ \} |

#### Returns

`void`

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
