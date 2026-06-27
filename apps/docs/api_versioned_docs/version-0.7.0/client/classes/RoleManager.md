# Class: RoleManager

## Extends

- `BaseManager`\<`string`, [`Role`](Role.md)\>

## Constructors

### Constructor

> **new RoleManager**(`client`, `server`, `limit?`): `RoleManager`

Manages API methods and caching for server roles.

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | `undefined` |
| `server` | [`Server`](Server.md) | `undefined` |
| `limit` | `number` | `Infinity` |

#### Returns

`RoleManager`

#### Overrides

`BaseManager<string, Role>.constructor`

## Properties

### cache

> **cache**: [`Collection`](Collection.md)\<`string`, [`Role`](Role.md)\>

#### Inherited from

`BaseManager.cache`

***

### client

> **client**: [`Client`](Client.md)

#### Inherited from

`BaseManager.client`

***

### server

> **server**: [`Server`](Server.md)

## Methods

### \[custom\]()

> **\[custom\]**(): [`Collection`](Collection.md)\<`string`, [`Role`](Role.md)\>

#### Returns

[`Collection`](Collection.md)\<`string`, [`Role`](Role.md)\>

***

### construct()

> `protected` **construct**(`data`): [`Role`](Role.md)

Tell BaseManager how to build a Role

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |

#### Returns

[`Role`](Role.md)

#### Overrides

`BaseManager.construct`

***

### create()

> **create**(`options`): `Promise`\<[`Role`](Role.md)\>

Creates a new role in this server.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`RoleCreateOptions`](../interfaces/RoleCreateOptions.md) | The name and optional rank of the new role |

#### Returns

`Promise`\<[`Role`](Role.md)\>

Role The role that was created

#### Throws

If the role cannot be created (e.g., lack of permissions, invalid options).

#### Throws

If invalid options are provided.

#### Example

```ts
// Create a new role named "Moderator" with rank 1
const moderatorRole = await server.roles.create({ name: "Moderator", rank: 1 });
console.log(`Created role: ${moderatorRole.name} with ID: ${moderatorRole.id}`);
```

***

### delete()

> **delete**(`role`): `Promise`\<`void`\>

Deletes a Role from the server.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `role` | [`RoleResolvable`](../type-aliases/RoleResolvable.md) | The RoleResolvable to delete |

#### Returns

`Promise`\<`void`\>

A promise that resolves when the role is successfully deleted.

#### Throws

If an invalid RoleResolvable is provided.

#### Throws

If the role cannot be deleted (e.g., lack of permissions).

#### Example

```ts
// Delete a role by its ID
await server.roles.delete("01JE2MM759J5D7CHJF084R7MJ2");
console.log("Role deleted successfully.");

// Delete a role using a Role object
const role = await server.roles.fetch("01JE2MM759J5D7CHJF084R7");
await server.roles.delete(role);
console.log("Role deleted successfully.");

// Delete a role by mention
await server.roles.delete("<%01JE2MM759J5D7CHJF084R7MJ2>");
console.log("Role deleted successfully.");
```

***

### edit()

> **edit**(`role`, `options`): `Promise`\<[`Role`](Role.md)\>

Edits an existing role in the server.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `role` | [`RoleResolvable`](../type-aliases/RoleResolvable.md) | The [RoleResolvable](../type-aliases/RoleResolvable.md) to edit. |
| `options` | [`RoleEditOptions`](../interfaces/RoleEditOptions.md) | The fields to update. |

#### Returns

`Promise`\<[`Role`](Role.md)\>

A promise that resolves to the updated Role.

#### Throws

If invalid options or RoleResolvable are provided.

#### Throws

If the API request fails (e.g., lack of permissions).

#### Example

```ts
// Rename a role and give it a red color
await server.roles.edit("01H...", { name: "Super Admin", colour: "#FF0000" });

// Remove the custom color from a role
await server.roles.edit(role, { colour: null });
```

***

### extractId()

> `protected` **extractId**(`data`): `string`

Tell BaseManager how to find the ID for Roles

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |

#### Returns

`string`

#### Overrides

`BaseManager.extractId`

***

### fetch()

> **fetch**(`role`, `force?`): `Promise`\<[`Role`](Role.md)\>

Fetches a Role from the API or resolves it from the local cache.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `role` | [`RoleResolvable`](../type-aliases/RoleResolvable.md) | `undefined` | The ID, mention, or Role object to fetch. |
| `force` | `boolean` | `false` | Whether to skip the cache check and force a direct API request. Defaults to false. |

#### Returns

`Promise`\<[`Role`](Role.md)\>

A promise that resolves to the fetched Role object.

#### Throws

If an invalid RoleResolvable is provided.

#### Throws

If the API request fails (e.g., the role does not exist).

#### Example

```ts
// Fetch a role from the API
const role = await server.roles.fetch("01JE2MM759J5D7CHJF084R7MJ2");
console.log(`Fetched role: ${role.name} with ID: ${role.id}`);

// Fetch a role by mention
const role = await.server.roles.fetch("<%01JE2MM759J5D7CHJF084R7MJ2>");
console.log(`Fetched role: ${role.name} with ID: ${role.id}`);

// Force fetch a role, bypassing the cache
const role = await server.roles.fetch("01JE2MM759J5D7CHJF084R7MJ2", true);
console.log(`Fetched role: ${role.name} with ID: ${role.id}`);
```

***

### resolve()

> **resolve**(`role`): [`Role`](Role.md) \| `undefined`

Resolves a RoleResolvable to a Role object from the cache.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `role` | [`RoleResolvable`](../type-aliases/RoleResolvable.md) | The RoleResolvable to resolve. |

#### Returns

[`Role`](Role.md) \| `undefined`

The resolved Role object, or undefined if not found.

***

### resolveId()

> **resolveId**(`role`): `string`

Extracts ID from a RoleResolvable.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `role` | [`RoleResolvable`](../type-aliases/RoleResolvable.md) | The RoleResolvable to extract the ID from. |

#### Returns

`string`

The extracted role ID.

#### Throws

TypeError if an invalid type is provided.

***

### setPermissions()

> **setPermissions**(`role`, `options`): `Promise`\<[`Role`](Role.md)\>

Updates the permissions for a role in the server.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `role` | [`RoleResolvable`](../type-aliases/RoleResolvable.md) | The RoleResolvable to update permissions for. |
| `options` | [`RolePermissionOptions`](../interfaces/RolePermissionOptions.md) | The allow and deny permissions to set. |

#### Returns

`Promise`\<[`Role`](Role.md)\>

A promise that resolves to the updated Role.

#### Throws

If an invalid RoleResolvable or options are provided.

#### Throws

If the API request fails.

#### Example

```ts
// Set permissions using an array of strings.
await server.roles.setPermissions(role, {
  allow: ["ManageChannel", "ViewChannel", "SendMessage"]
});
```

***

### setRanks()

> **setRanks**(`ranks`): `Promise`\<[`Server`](Server.md)\>

Updates the hierarchical positions of roles in the server.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `ranks` | [`RoleResolvable`](../type-aliases/RoleResolvable.md)[] | An array of RoleResolvables representing the new order of roles. |

#### Returns

`Promise`\<[`Server`](Server.md)\>

A promise that resolves when the ranks are successfully updated.

#### Throws

If the ranks parameter is not an array or contains invalid resolvables.

#### Throws

If the API request fails.

#### Example

```ts
// Reorder roles by passing an array of Role objects or IDs
await server.roles.setRanks(["RoleID_1", adminRoleObject, "RoleID_3"]);
```
