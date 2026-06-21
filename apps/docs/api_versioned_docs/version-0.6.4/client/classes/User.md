# Class: User

The base class for all structures.

## Extends

- [`Base`](Base.md)

## Extended by

- [`ClientUser`](ClientUser.md)

## Constructors

### Constructor

> **new User**(`client`, `data`): `User`

#### Parameters

| Parameter | Type                  |
| --------- | --------------------- |
| `client`  | [`Client`](Client.md) |
| `data`    | \{ \}                 |

#### Returns

`User`

#### Overrides

[`Base`](Base.md).[`constructor`](Base.md#constructor)

## Properties

### avatar?

> `optional` **avatar?**: [`Attachment`](Attachment.md) \| `null`

---

### badges?

> `optional` **badges?**: `number`

---

### bot

> **bot**: `false` \| [`BotInformation`](../interfaces/BotInformation.md)

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

### discriminator

> **discriminator**: `string`

---

### displayName?

> `optional` **displayName?**: `string` \| `null`

---

### flags?

> `optional` **flags?**: `number`

---

### id

> `readonly` **id**: `string`

#### Inherited from

[`Base`](Base.md).[`id`](Base.md#id)

---

### online

> **online**: `boolean`

---

### privileged?

> `optional` **privileged?**: `boolean`

---

### relationship

> **relationship**: [`UserRelationShip`](../type-aliases/UserRelationShip.md)

---

### status?

> `optional` **status?**: \{ \} \| `null`

---

### username

> **username**: `string`

## Accessors

### tag

#### Get Signature

> **get** **tag**(): `string`

Convenience getter to return the user's tag (username#discriminator)

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

### \_patch()

> **\_patch**(`data`, `clear?`): `void`

#### Parameters

| Parameter | Type       |
| --------- | ---------- |
| `data`    | \{ \}      |
| `clear?`  | `string`[] |

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

### fetch()

> **fetch**(`force?`): `Promise`\<`User`\>

Fetch a User to update their information

#### Parameters

| Parameter | Type      | Default value | Description                                   |
| --------- | --------- | ------------- | --------------------------------------------- |
| `force`   | `boolean` | `false`       | Skip the cache check and force an API request |

#### Returns

`Promise`\<`User`\>

The fetched User object

#### Throws

Error if the user cannot be found or fetched

#### Example

```ts
// Fetch a user
await user.fetch();
```

---

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`Base`](Base.md).[`toString`](Base.md#tostring)
