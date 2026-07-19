# Class: ReactionCollector

Abstract class for defining a new Collector

## Extends

- [`Collector`](Collector.md)\<`string`, [`MessageReaction`](MessageReaction.md)\>

## Constructors

### Constructor

> **new ReactionCollector**(`message`, `options?`): `ReactionCollector`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | [`Message`](Message.md) |
| `options` | [`ReactionCollectorOptions`](../interfaces/ReactionCollectorOptions.md) |

#### Returns

`ReactionCollector`

#### Overrides

[`Collector`](Collector.md).[`constructor`](Collector.md#constructor)

## Properties

### client

> `readonly` **client**: [`Client`](Client.md)

#### Inherited from

[`Collector`](Collector.md).[`client`](Collector.md#client)

***

### collected

> **collected**: [`Collection`](Collection.md)\<`string`, [`MessageReaction`](MessageReaction.md)\>

#### Inherited from

[`Collector`](Collector.md).[`collected`](Collector.md#collected)

***

### ended

> **ended**: `boolean` = `false`

#### Inherited from

[`Collector`](Collector.md).[`ended`](Collector.md#ended)

***

### filter

> **filter**: (`item`, ...`args`) => `boolean`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `item` | [`MessageReaction`](MessageReaction.md) |
| ...`args` | `any`[] |

#### Returns

`boolean`

#### Inherited from

[`Collector`](Collector.md).[`filter`](Collector.md#filter)

***

### message

> **message**: [`Message`](Message.md)

***

### messageId

> **messageId**: `string`

***

### options

> **options**: [`CollectorOptions`](../interfaces/CollectorOptions.md)\<[`MessageReaction`](MessageReaction.md)\>

#### Inherited from

[`Collector`](Collector.md).[`options`](Collector.md#options)

***

### total

> **total**: `number` = `0`

***

### users

> **users**: `Set`\<`string`\>

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncIterableIterator`\<\[`string`, [`MessageReaction`](MessageReaction.md)\]\>

Allows iterating over collected items asynchronously.

#### Returns

`AsyncIterableIterator`\<\[`string`, [`MessageReaction`](MessageReaction.md)\]\>

#### Example

```ts
for await (const [id, message] of collector) {
  console.log(`Received message: ${message.content}`);
}
```

#### Inherited from

[`Collector`](Collector.md).[`[asyncIterator]`](Collector.md#asynciterator)

***

### checkEnd()

> **checkEnd**(): `void`

Check if we should end upon collecting/disposing

#### Returns

`void`

#### Inherited from

[`Collector`](Collector.md).[`checkEnd`](Collector.md#checkend)

***

### collect()

> **collect**(`reaction`): `string` \| `null`

Returns a key if the item should be collected, or null to skip

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `reaction` | [`MessageReaction`](MessageReaction.md) |

#### Returns

`string` \| `null`

#### Overrides

[`Collector`](Collector.md).[`collect`](Collector.md#collect)

***

### dispose()

> **dispose**(`reaction`): `string` \| `null`

Returns a key if the item should be disposed, or null to skip

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `reaction` | [`MessageReaction`](MessageReaction.md) |

#### Returns

`string` \| `null`

#### Overrides

[`Collector`](Collector.md).[`dispose`](Collector.md#dispose)

***

### endReason()

> **endReason**(): `string` \| `null`

Check if there's a reason to end

#### Returns

`string` \| `null`

#### Overrides

[`Collector`](Collector.md).[`endReason`](Collector.md#endreason)

***

### handleCollect()

> **handleCollect**(`item`, ...`args`): `void`

Evaluates an item and possibly passes it to the collector

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `item` | [`MessageReaction`](MessageReaction.md) |
| ...`args` | `any`[] |

#### Returns

`void`

#### Inherited from

[`Collector`](Collector.md).[`handleCollect`](Collector.md#handlecollect)

***

### handleDispose()

> **handleDispose**(`item`, ...`args`): `void`

Evaluates an item and possibly removes it from the collector

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `item` | [`MessageReaction`](MessageReaction.md) |
| ...`args` | `any`[] |

#### Returns

`void`

#### Inherited from

[`Collector`](Collector.md).[`handleDispose`](Collector.md#handledispose)

***

### stop()

> **stop**(`reason?`): `void`

Stops the collector.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `reason` | `string` | `"user"` |

#### Returns

`void`

#### Inherited from

[`Collector`](Collector.md).[`stop`](Collector.md#stop)
