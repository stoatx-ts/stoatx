# Interface: CollectorOptions\<V\>

Options to be passed to a Collector

## Extended by

- [`MessageCollectorOptions`](MessageCollectorOptions.md)
- [`ReactionCollectorOptions`](ReactionCollectorOptions.md)

## Type Parameters

| Type Parameter |
| -------------- |
| `V`            |

## Properties

### dispose?

> `optional` **dispose?**: `boolean`

Whether to dispose data when it's deleted

---

### filter?

> `optional` **filter?**: (`item`, ...`args`) => `boolean`

The filter applied to this collector

#### Parameters

| Parameter | Type    |
| --------- | ------- |
| `item`    | `V`     |
| ...`args` | `any`[] |

#### Returns

`boolean`

---

### idle?

> `optional` **idle?**: `number`

How long to stop the collector after inactivity in milliseconds

---

### time?

> `optional` **time?**: `number`

How long to run the collector for in milliseconds
