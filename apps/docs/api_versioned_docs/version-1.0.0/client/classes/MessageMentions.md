# Class: MessageMentions

## Constructors

### Constructor

> **new MessageMentions**(`client`, `message`, `userIds`, `roleIds`): `MessageMentions`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `message` | [`Message`](Message.md) |
| `userIds` | `string`[] \| `null` |
| `roleIds` | `string`[] \| `null` |

#### Returns

`MessageMentions`

## Properties

### channelIds

> `readonly` **channelIds**: `string`[]

Raw channel IDs parsed from message content

***

### roleIds

> `readonly` **roleIds**: `string`[]

Raw role IDs from the API

***

### userIds

> `readonly` **userIds**: `string`[]

Raw user IDs from the API

## Accessors

### channels

#### Get Signature

> **get** **channels**(): [`Collection`](Collection.md)\<`string`, [`BaseChannel`](BaseChannel.md)\>

Mentioned channels resolved from cache

##### Returns

[`Collection`](Collection.md)\<`string`, [`BaseChannel`](BaseChannel.md)\>

***

### members

#### Get Signature

> **get** **members**(): [`Collection`](Collection.md)\<`string`, [`Member`](Member.md)\>

Mentioned members resolved from cache (only in server channels)

##### Returns

[`Collection`](Collection.md)\<`string`, [`Member`](Member.md)\>

***

### roles

#### Get Signature

> **get** **roles**(): [`Collection`](Collection.md)\<`string`, [`Role`](Role.md)\>

Mentioned roles resolved from cache

##### Returns

[`Collection`](Collection.md)\<`string`, [`Role`](Role.md)\>

***

### users

#### Get Signature

> **get** **users**(): [`Collection`](Collection.md)\<`string`, [`User`](User.md)\>

Mentioned users resolved from cache

##### Returns

[`Collection`](Collection.md)\<`string`, [`User`](User.md)\>

## Methods

### has()

> **has**(`userId`): `boolean`

Whether the given user ID is mentioned

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `userId` | `string` |

#### Returns

`boolean`
