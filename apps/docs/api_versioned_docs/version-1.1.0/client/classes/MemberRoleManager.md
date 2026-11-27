# Class: MemberRoleManager

## Constructors

### Constructor

> **new MemberRoleManager**(`member`): `MemberRoleManager`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `member` | [`Member`](Member.md) |

#### Returns

`MemberRoleManager`

## Properties

### member

> **member**: [`Member`](Member.md)

## Accessors

### cache

#### Get Signature

> **get** **cache**(): [`Collection`](Collection.md)\<`string`, [`Role`](Role.md)\>

Gets a Collection of the actual Role objects this member has.
This dynamically pulls from the Server's role cache so references are always up to date

##### Returns

[`Collection`](Collection.md)\<`string`, [`Role`](Role.md)\>

## Methods

### add()

> **add**(`role`): `Promise`\<[`Member`](Member.md)\>

Adds a role to the member.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `role` | [`RoleResolvable`](../type-aliases/RoleResolvable.md) | The RoleResolvable to add. |

#### Returns

`Promise`\<[`Member`](Member.md)\>

A promise that resolves to the updated Member.

***

### has()

> **has**(`role`): `boolean`

Checks if the member has a specific role.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `role` | [`RoleResolvable`](../type-aliases/RoleResolvable.md) | The RoleResolvable to check for. |

#### Returns

`boolean`

***

### remove()

> **remove**(`role`): `Promise`\<[`Member`](Member.md)\>

Removes a role from the member.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `role` | [`RoleResolvable`](../type-aliases/RoleResolvable.md) | The RoleResolvable to remove. |

#### Returns

`Promise`\<[`Member`](Member.md)\>

A promise that resolves to the updated Member.

***

### set()

> **set**(`roles`): `Promise`\<[`Member`](Member.md)\>

Overwrites all roles on the member with a completely new array.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `roles` | [`RoleResolvable`](../type-aliases/RoleResolvable.md)[] | An array of RoleResolvables. |

#### Returns

`Promise`\<[`Member`](Member.md)\>

A promise that resolves to the updated Member.
