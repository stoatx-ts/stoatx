# Class: Emoji

The base class for all structures.

## Extends

- [`Base`](Base.md)

## Constructors

### Constructor

> **new Emoji**(`client`, `data`): `Emoji`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `data` | \{ \} |

#### Returns

`Emoji`

#### Overrides

[`Base`](Base.md).[`constructor`](Base.md#constructor)

## Properties

### animated

> **animated**: `boolean` = `false`

***

### cachedAt

> **cachedAt**: `number`

#### Inherited from

[`Base`](Base.md).[`cachedAt`](Base.md#cachedat)

***

### client

> `protected` `readonly` **client**: [`Client`](Client.md)

#### Inherited from

[`Base`](Base.md).[`client`](Base.md#client)

***

### creatorId

> **creatorId**: `string`

***

### id

> `readonly` **id**: `string`

#### Inherited from

[`Base`](Base.md).[`id`](Base.md#id)

***

### name

> **name**: `string`

***

### nsfw

> **nsfw**: `boolean` = `false`

***

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

***

### \_patch()

> **\_patch**(`data`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |

#### Returns

`void`

***

### delete()

> **delete**(): `Promise`\<`void`\>

Deletes this emoji from the server.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the emoji has been deleted.

#### Throws

If the API request fails or if the emoji is detached.

#### Example

```ts
// Delete an emoji from the server
await emoji.delete();
```

***

### edit()

> **edit**(`options`): `Promise`\<`Emoji`\>

Edits this emoji's properties.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`EmojiEditOptions`](../interfaces/EmojiEditOptions.md) | The options to edit the emoji with. |

#### Returns

`Promise`\<`Emoji`\>

A promise that resolves to the edited Emoji object.

#### Throws

If the API request fails or if the emoji is detached.

#### Example

```ts
// Edit an emoji's name
await emoji.edit({ name: "new_name" });
```

***

### equals()

> **equals**(`other`): `boolean`

Compares this object with another to see if they represent the same entity.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `other` | `string` \| [`Base`](Base.md) |

#### Returns

`boolean`

#### Inherited from

[`Base`](Base.md).[`equals`](Base.md#equals)

***

### fetch()

> **fetch**(`force?`): `Promise`\<`Emoji`\>

Fetch this emoji from the API or resolves it from the local cache.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `force?` | `boolean` | Whether to skip the cache check and force a direct API request. Defaults to false. |

#### Returns

`Promise`\<`Emoji`\>

A promise that resolves to the fetched Emoji object.

#### Throws

If the API request fails or if the emoji is detached.

#### Example

```ts
// Force fetch emoji to update its data
await emoji.fetch(true);
```

***

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`Base`](Base.md).[`toString`](Base.md#tostring)
