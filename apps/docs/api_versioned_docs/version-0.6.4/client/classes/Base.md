# Abstract Class: Base

The base class for all structures.

## Extended by

- [`Attachment`](Attachment.md)
- [`BaseChannel`](BaseChannel.md)
- [`Member`](Member.md)
- [`Message`](Message.md)
- [`Role`](Role.md)
- [`Server`](Server.md)
- [`User`](User.md)
- [`Emoji`](Emoji.md)

## Constructors

### Constructor

> `protected` **new Base**(`client`, `data`): `Base`

#### Parameters

| Parameter  | Type                   |
| ---------- | ---------------------- |
| `client`   | [`Client`](Client.md)  |
| `data`     | \{ `_id`: `string`; \} |
| `data._id` | `string`               |

#### Returns

`Base`

## Properties

### cachedAt

> **cachedAt**: `number`

---

### client

> `protected` `readonly` **client**: [`Client`](Client.md)

---

### id

> `readonly` **id**: `string`

## Methods

### \_clone()

> **\_clone**(): `this`

Helper to quickly clone a structure

#### Returns

`this`

---

### equals()

> **equals**(`other`): `boolean`

Compares this object with another to see if they represent the same entity.

#### Parameters

| Parameter | Type               |
| --------- | ------------------ |
| `other`   | `string` \| `Base` |

#### Returns

`boolean`

---

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`
