# Class: Collection\<K, V\>

A utility class that extends the native JavaScript Map with Array-like methods.

## Extends

- `Map`\<`K`, `V`\>

## Type Parameters

| Type Parameter |
| ------ |
| `K` |
| `V` |

## Constructors

### Constructor

> **new Collection**\<`K`, `V`\>(`limit?`): `Collection`\<`K`, `V`\>

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `limit` | `number` | `Infinity` |

#### Returns

`Collection`\<`K`, `V`\>

#### Overrides

`Map<K, V>.constructor`

## Properties

### limit

> **limit**: `number`

## Methods

### filter()

> **filter**(`fn`): `Collection`\<`K`, `V`\>

Returns a new Collection containing only the items where the function returns true.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn` | (`value`, `key`, `collection`) => `boolean` |

#### Returns

`Collection`\<`K`, `V`\>

***

### find()

> **find**(`fn`): `V` \| `undefined`

Finds the first item where the given function returns true.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn` | (`value`, `key`, `collection`) => `boolean` |

#### Returns

`V` \| `undefined`

***

### first()

> **first**(): `V` \| `undefined`

Gets the very first value in the Collection (based on insertion order).

#### Returns

`V` \| `undefined`

***

### last()

> **last**(): `V` \| `undefined`

Gets the very last value in the Collection.

#### Returns

`V` \| `undefined`

***

### map()

> **map**\<`T`\>(`fn`): `T`[]

Maps each item to a new array of values.

#### Type Parameters

| Type Parameter |
| ------ |
| `T` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn` | (`value`, `key`, `collection`) => `T` |

#### Returns

`T`[]

***

### set()

> **set**(`key`, `value`): `this`

Overrides the default set method to enforce the maximum cache size.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `key` | `K` |
| `value` | `V` |

#### Returns

`this`

#### Overrides

`Map.set`

***

### some()

> **some**(`fn`): `boolean`

Checks if at least one item matches the condition.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `fn` | (`value`, `key`, `collection`) => `boolean` |

#### Returns

`boolean`
