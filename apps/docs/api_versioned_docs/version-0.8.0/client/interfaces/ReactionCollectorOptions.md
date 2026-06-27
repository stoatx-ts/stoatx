# Interface: ReactionCollectorOptions

Options to be passed to a Collector

## Extends

- [`CollectorOptions`](CollectorOptions.md)\<[`MessageReaction`](../classes/MessageReaction.md)\>

## Properties

### dispose?

> `optional` **dispose?**: `boolean`

Whether to dispose data when it's deleted

#### Inherited from

[`CollectorOptions`](CollectorOptions.md).[`dispose`](CollectorOptions.md#dispose)

***

### filter?

> `optional` **filter?**: (`item`, ...`args`) => `boolean`

The filter applied to this collector

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `item` | [`MessageReaction`](../classes/MessageReaction.md) |
| ...`args` | `any`[] |

#### Returns

`boolean`

#### Inherited from

[`CollectorOptions`](CollectorOptions.md).[`filter`](CollectorOptions.md#filter)

***

### idle?

> `optional` **idle?**: `number`

How long to stop the collector after inactivity in milliseconds

#### Inherited from

[`CollectorOptions`](CollectorOptions.md).[`idle`](CollectorOptions.md#idle)

***

### max?

> `optional` **max?**: `number`

The maximum number of reactions to collect

***

### maxUsers?

> `optional` **maxUsers?**: `number`

The maximum number of users to collect reactions from

***

### time?

> `optional` **time?**: `number`

How long to run the collector for in milliseconds

#### Inherited from

[`CollectorOptions`](CollectorOptions.md).[`time`](CollectorOptions.md#time)
