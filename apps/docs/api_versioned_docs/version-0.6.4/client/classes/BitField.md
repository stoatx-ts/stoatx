# Class: BitField

## Extended by

- [`Permissions`](Permissions.md)

## Constructors

### Constructor

> **new BitField**(`bits?`): `BitField`

#### Parameters

| Parameter | Type                                                          |
| --------- | ------------------------------------------------------------- |
| `bits?`   | [`BitFieldResolvable`](../type-aliases/BitFieldResolvable.md) |

#### Returns

`BitField`

## Properties

### bitfield

> **bitfield**: `number` \| `bigint`

---

### DefaultBit

> `static` **DefaultBit**: `number` \| `bigint` = `0`

---

### Flags

> `static` **Flags**: `Record`\<`string`, `number` \| `bigint`\> = `{}`

## Methods

### \[iterator\]()

> **\[iterator\]**(...`hasParams`): `IterableIterator`\<`string`\>

Iterates over the names of all flags that are set in this bitfield.

#### Parameters

| Parameter      | Type    |
| -------------- | ------- |
| ...`hasParams` | `any`[] |

#### Returns

`IterableIterator`\<`string`\>

#### Example

```ts
for (const flag of perms) {
  console.log(flag); // 'SendMessage', 'ViewChannel', etc.
}
```

---

### add()

> **add**(...`bits`): `this`

Adds one or more bits to this bitfield.
If the instance is frozen, returns a new BitField with the bits added.

#### Parameters

| Parameter | Type                                                            | Description        |
| --------- | --------------------------------------------------------------- | ------------------ |
| ...`bits` | [`BitFieldResolvable`](../type-aliases/BitFieldResolvable.md)[] | The bit(s) to add. |

#### Returns

`this`

This instance (or a new one if frozen), with the bits added.

#### Example

```ts
perms.add("SendMessage", "ViewChannel");
```

---

### any()

> **any**(`bit`): `boolean`

Checks whether this bitfield has any of the given bits set.

#### Parameters

| Parameter | Type                                                          | Description                 |
| --------- | ------------------------------------------------------------- | --------------------------- |
| `bit`     | [`BitFieldResolvable`](../type-aliases/BitFieldResolvable.md) | The bit(s) to test against. |

#### Returns

`boolean`

`true` if at least one of the provided bits is set.

#### Example

```ts
perms.any(["SendMessage", "ManageChannel"]); // true if either is set
```

---

### equals()

> **equals**(`bit`): `boolean`

Checks whether this bitfield is exactly equal to the given bit value.

#### Parameters

| Parameter | Type                                                          | Description                    |
| --------- | ------------------------------------------------------------- | ------------------------------ |
| `bit`     | [`BitFieldResolvable`](../type-aliases/BitFieldResolvable.md) | The bit(s) to compare against. |

#### Returns

`boolean`

`true` if the resolved bit value is identical to this bitfield.

#### Example

```ts
new Permissions(0n).equals(0n); // true
```

---

### freeze()

> **freeze**(): `Readonly`\<`this`\>

Freezes this BitField instance, making it immutable.
Subsequent calls to `add()` or `remove()` will return a new instance instead of mutating this one.

#### Returns

`Readonly`\<`this`\>

This instance, frozen.

---

### has()

> **has**(`bit`, ...`_hasParams`): `boolean`

Checks whether this bitfield has _all_ of the given bits set.

#### Parameters

| Parameter       | Type                                                          | Description              |
| --------------- | ------------------------------------------------------------- | ------------------------ |
| `bit`           | [`BitFieldResolvable`](../type-aliases/BitFieldResolvable.md) | The bit(s) to check for. |
| ...`_hasParams` | `any`[]                                                       | -                        |

#### Returns

`boolean`

`true` if every provided bit is set in this bitfield.

#### Example

```ts
perms.has("SendMessage");
perms.has(["SendMessage", "ViewChannel"]); // true only if both are set
```

---

### missing()

> **missing**(`bits`, ...`hasParams`): `string`[]

Returns the flag names present in `bits` that are _missing_ from this bitfield.

#### Parameters

| Parameter      | Type                                                          | Description                |
| -------------- | ------------------------------------------------------------- | -------------------------- |
| `bits`         | [`BitFieldResolvable`](../type-aliases/BitFieldResolvable.md) | The bits to check against. |
| ...`hasParams` | `any`[]                                                       | -                          |

#### Returns

`string`[]

An array of flag name strings that are in `bits` but not in this bitfield.

#### Example

```ts
// If perms only has SendMessage:
perms.missing(["SendMessage", "ManageChannel"]); // ['ManageChannel']
```

---

### remove()

> **remove**(...`bits`): `this`

Removes one or more bits from this bitfield.
If the instance is frozen, returns a new BitField with the bits removed.

#### Parameters

| Parameter | Type                                                            | Description           |
| --------- | --------------------------------------------------------------- | --------------------- |
| ...`bits` | [`BitFieldResolvable`](../type-aliases/BitFieldResolvable.md)[] | The bit(s) to remove. |

#### Returns

`this`

This instance (or a new one if frozen), with the bits cleared.

#### Example

```ts
perms.remove("ManageChannel");
```

---

### serialize()

> **serialize**(...`hasParams`): `Record`\<`string`, `boolean`\>

Serializes this bitfield to a plain object mapping each flag name to a boolean
indicating whether that flag is set.

#### Parameters

| Parameter      | Type    |
| -------------- | ------- |
| ...`hasParams` | `any`[] |

#### Returns

`Record`\<`string`, `boolean`\>

A record of `{ [flagName]: boolean }` for all defined flags.

#### Example

```ts
perms.serialize();
// { SendMessage: true, ManageChannel: false, ... }
```

---

### toArray()

> **toArray**(...`hasParams`): `string`[]

Returns an array of flag names that are set in this bitfield.

#### Parameters

| Parameter      | Type    |
| -------------- | ------- |
| ...`hasParams` | `any`[] |

#### Returns

`string`[]

An array of string flag names.

#### Example

```ts
perms.toArray(); // ['SendMessage', 'ViewChannel']
```

---

### toJSON()

> **toJSON**(): `string` \| `number`

Returns the bitfield value as a JSON-safe primitive.
Numbers are returned as-is; bigints are converted to their string representation
to avoid JSON serialization errors.

#### Returns

`string` \| `number`

---

### valueOf()

> **valueOf**(): `number` \| `bigint`

Returns the underlying numeric value of this bitfield.
Allows BitField instances to be used directly in arithmetic expressions.

#### Returns

`number` \| `bigint`

---

### resolve()

> `static` **resolve**(`bit?`): `number` \| `bigint`

Resolves a [BitFieldResolvable](../type-aliases/BitFieldResolvable.md) into a raw `number | bigint`.

Resolution rules (in order):

- `undefined` → `DefaultBit`
- A number or bigint matching `DefaultBit`'s type and >= 0 → returned as-is
- A `BitField` instance → its `.bitfield` value
- An array → each element resolved and OR'd together
- A numeric string → parsed as `BigInt` or `Number` depending on `DefaultBit`'s type
- A named string flag → looked up in `Flags`
- Anything else → throws `RangeError`

#### Parameters

| Parameter | Type                                                          | Description           |
| --------- | ------------------------------------------------------------- | --------------------- |
| `bit?`    | [`BitFieldResolvable`](../type-aliases/BitFieldResolvable.md) | The value to resolve. |

#### Returns

`number` \| `bigint`

#### Throws

If the value cannot be resolved to a valid bit.
