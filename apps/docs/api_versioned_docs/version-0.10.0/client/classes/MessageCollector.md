# Class: MessageCollector

Collects messages on a channel.

## Extends

- [`Collector`](Collector.md)\<`string`, [`Message`](Message.md)\>

## Constructors

### Constructor

> **new MessageCollector**(`channel`, `options?`): `MessageCollector`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `channel` | [`BaseChannel`](BaseChannel.md) |
| `options` | [`MessageCollectorOptions`](../interfaces/MessageCollectorOptions.md) |

#### Returns

`MessageCollector`

#### Overrides

[`Collector`](Collector.md).[`constructor`](Collector.md#constructor)

## Properties

### channel

> **channel**: [`BaseChannel`](BaseChannel.md)

***

### channelId

> **channelId**: `string`

***

### client

> `readonly` **client**: [`Client`](Client.md)

#### Inherited from

[`Collector`](Collector.md).[`client`](Collector.md#client)

***

### collected

> **collected**: [`Collection`](Collection.md)\<`string`, [`Message`](Message.md)\>

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
| `item` | [`Message`](Message.md) |
| ...`args` | `any`[] |

#### Returns

`boolean`

#### Inherited from

[`Collector`](Collector.md).[`filter`](Collector.md#filter)

***

### options

> **options**: [`CollectorOptions`](../interfaces/CollectorOptions.md)\<[`Message`](Message.md)\>

#### Inherited from

[`Collector`](Collector.md).[`options`](Collector.md#options)

***

### processed

> **processed**: `number` = `0`

***

### total

> **total**: `number` = `0`

## Methods

### \[asyncIterator\]()

> **\[asyncIterator\]**(): `AsyncIterableIterator`\<\[`string`, [`Message`](Message.md)\]\>

Allows iterating over collected items asynchronously.

#### Returns

`AsyncIterableIterator`\<\[`string`, [`Message`](Message.md)\]\>

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

> **collect**(`message`): `string` \| `null`

Returns a key if the item should be collected, or null to skip

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | [`Message`](Message.md) |

#### Returns

`string` \| `null`

#### Overrides

[`Collector`](Collector.md).[`collect`](Collector.md#collect)

***

### dispose()

> **dispose**(`message`): `string` \| `null`

Returns a key if the item should be disposed, or null to skip

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | [`Message`](Message.md) \| \{ `channelId`: `string`; `id`: `string`; \} |

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

> **handleCollect**(`message`): `void`

Evaluates an item and possibly passes it to the collector

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `message` | [`Message`](Message.md) |

#### Returns

`void`

#### Overrides

[`Collector`](Collector.md).[`handleCollect`](Collector.md#handlecollect)

***

### handleDispose()

> **handleDispose**(`item`, ...`args`): `void`

Evaluates an item and possibly removes it from the collector

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `item` | [`Message`](Message.md) |
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
