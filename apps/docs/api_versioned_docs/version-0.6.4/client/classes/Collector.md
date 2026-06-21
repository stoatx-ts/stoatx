# Abstract Class: Collector\<K, V\>

Abstract class for defining a new Collector

## Extends

- `EventEmitter`

## Extended by

- [`MessageCollector`](MessageCollector.md)
- [`ReactionCollector`](ReactionCollector.md)

## Type Parameters

| Type Parameter |
| -------------- |
| `K`            |
| `V`            |

## Constructors

### Constructor

> `protected` **new Collector**\<`K`, `V`\>(`client`, `options?`): `Collector`\<`K`, `V`\>

#### Parameters

| Parameter | Type                                                           |
| --------- | -------------------------------------------------------------- |
| `client`  | [`Client`](Client.md)                                          |
| `options` | [`CollectorOptions`](../interfaces/CollectorOptions.md)\<`V`\> |

#### Returns

`Collector`\<`K`, `V`\>

#### Overrides

`EventEmitter.constructor`

## Properties

### client

> `readonly` **client**: [`Client`](Client.md)

---

### collected

> **collected**: [`Collection`](Collection.md)\<`K`, `V`\>

---

### ended

> **ended**: `boolean` = `false`

---

### filter

> **filter**: (`item`, ...`args`) => `boolean`

#### Parameters

| Parameter | Type    |
| --------- | ------- |
| `item`    | `V`     |
| ...`args` | `any`[] |

#### Returns

`boolean`

---

### options

> **options**: [`CollectorOptions`](../interfaces/CollectorOptions.md)\<`V`\>

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncIterableIterator`\<\[`K`, `V`\]\>

Allows iterating over collected items asynchronously.

#### Returns

`AsyncIterableIterator`\<\[`K`, `V`\]\>

#### Example

```ts
for await (const [id, message] of collector) {
  console.log(`Received message: ${message.content}`);
}
```

---

### checkEnd()

> **checkEnd**(): `void`

Check if we should end upon collecting/disposing

#### Returns

`void`

---

### collect()

> `abstract` **collect**(`item`, ...`args`): `K` \| `null`

Returns a key if the item should be collected, or null to skip

#### Parameters

| Parameter | Type    |
| --------- | ------- |
| `item`    | `V`     |
| ...`args` | `any`[] |

#### Returns

`K` \| `null`

---

### dispose()

> `abstract` **dispose**(`item`, ...`args`): `K` \| `null`

Returns a key if the item should be disposed, or null to skip

#### Parameters

| Parameter | Type    |
| --------- | ------- |
| `item`    | `V`     |
| ...`args` | `any`[] |

#### Returns

`K` \| `null`

---

### endReason()

> **endReason**(): `string` \| `null`

Check if there's a reason to end

#### Returns

`string` \| `null`

---

### handleCollect()

> **handleCollect**(`item`, ...`args`): `void`

Evaluates an item and possibly passes it to the collector

#### Parameters

| Parameter | Type    |
| --------- | ------- |
| `item`    | `V`     |
| ...`args` | `any`[] |

#### Returns

`void`

---

### handleDispose()

> **handleDispose**(`item`, ...`args`): `void`

Evaluates an item and possibly removes it from the collector

#### Parameters

| Parameter | Type    |
| --------- | ------- |
| `item`    | `V`     |
| ...`args` | `any`[] |

#### Returns

`void`

---

### stop()

> **stop**(`reason?`): `void`

Stops the collector.

#### Parameters

| Parameter | Type     | Default value |
| --------- | -------- | ------------- |
| `reason`  | `string` | `"user"`      |

#### Returns

`void`
