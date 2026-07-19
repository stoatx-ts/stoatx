# Class: ClientUser

Represents the authenticated bot's user object.

## Extends

- [`User`](User.md)

## Constructors

### Constructor

> **new ClientUser**(`client`, `data`): `ClientUser`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `data` | \{ \} |

#### Returns

`ClientUser`

#### Overrides

[`User`](User.md).[`constructor`](User.md#constructor)

## Properties

### avatar?

> `optional` **avatar?**: [`Attachment`](Attachment.md) \| `null`

#### Inherited from

[`User`](User.md).[`avatar`](User.md#avatar)

***

### badges?

> `optional` **badges?**: `number`

#### Inherited from

[`User`](User.md).[`badges`](User.md#badges)

***

### bot

> **bot**: `false` \| [`BotInformation`](../interfaces/BotInformation.md)

#### Inherited from

[`User`](User.md).[`bot`](User.md#bot)

***

### cachedAt

> **cachedAt**: `number`

#### Inherited from

[`User`](User.md).[`cachedAt`](User.md#cachedat)

***

### client

> `protected` `readonly` **client**: [`Client`](Client.md)

#### Inherited from

[`User`](User.md).[`client`](User.md#client)

***

### createdAt

> **createdAt**: `Date`

#### Inherited from

[`User`](User.md).[`createdAt`](User.md#createdat)

***

### createdTimestamp

> **createdTimestamp**: `number`

#### Inherited from

[`User`](User.md).[`createdTimestamp`](User.md#createdtimestamp)

***

### discriminator

> **discriminator**: `string`

#### Inherited from

[`User`](User.md).[`discriminator`](User.md#discriminator)

***

### displayName?

> `optional` **displayName?**: `string` \| `null`

#### Inherited from

[`User`](User.md).[`displayName`](User.md#displayname)

***

### flags?

> `optional` **flags?**: `number`

#### Inherited from

[`User`](User.md).[`flags`](User.md#flags)

***

### id

> `readonly` **id**: `string`

#### Inherited from

[`User`](User.md).[`id`](User.md#id)

***

### online

> **online**: `boolean`

#### Inherited from

[`User`](User.md).[`online`](User.md#online)

***

### privileged?

> `optional` **privileged?**: `boolean`

#### Inherited from

[`User`](User.md).[`privileged`](User.md#privileged)

***

### pronouns?

> `optional` **pronouns?**: `string` \| `null` = `null`

#### Inherited from

[`User`](User.md).[`pronouns`](User.md#pronouns)

***

### relationship

> **relationship**: [`UserRelationShip`](../type-aliases/UserRelationShip.md)

#### Inherited from

[`User`](User.md).[`relationship`](User.md#relationship)

***

### status?

> `optional` **status?**: \{ \} \| `null`

#### Inherited from

[`User`](User.md).[`status`](User.md#status)

***

### username

> **username**: `string`

#### Inherited from

[`User`](User.md).[`username`](User.md#username)

## Accessors

### tag

#### Get Signature

> **get** **tag**(): `string`

Convenience getter to return the user's tag (username#discriminator)

##### Returns

`string`

#### Inherited from

[`User`](User.md).[`tag`](User.md#tag)

## Methods

### \_clone()

> **\_clone**(): `this`

Helper to quickly clone a structure

#### Returns

`this`

#### Inherited from

[`User`](User.md).[`_clone`](User.md#_clone)

***

### \_patch()

> **\_patch**(`data`, `clear?`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |
| `clear?` | (`"Avatar"` \| `"StatusText"` \| `"StatusPresence"` \| `"ProfileContent"` \| `"ProfileBackground"` \| `"DisplayName"` \| `"Pronouns"` \| `"Internal"`)[] |

#### Returns

`void`

#### Inherited from

[`User`](User.md).[`_patch`](User.md#_patch)

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

[`User`](User.md).[`equals`](User.md#equals)

***

### fetch()

> **fetch**(`force?`): `Promise`\<`ClientUser`\>

Fetch a User to update their information

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `force` | `boolean` | `false` | Skip the cache check and force an API request |

#### Returns

`Promise`\<`ClientUser`\>

The fetched User object

#### Throws

Error if the user cannot be found or fetched

#### Example

```ts
// Fetch a user
await user.fetch();
```

#### Inherited from

[`User`](User.md).[`fetch`](User.md#fetch)

***

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`User`](User.md).[`toString`](User.md#tostring)
