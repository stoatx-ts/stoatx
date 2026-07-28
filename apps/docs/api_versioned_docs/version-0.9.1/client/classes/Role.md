# Class: Role

The base class for all structures.

## Extends

- [`Base`](Base.md)

## Constructors

### Constructor

> **new Role**(`client`, `data`, `serverId`): `Role`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |
| `data` | \{ \} |
| `serverId` | `string` |

#### Returns

`Role`

#### Overrides

[`Base`](Base.md).[`constructor`](Base.md#constructor)

## Properties

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

### color

> **color**: `string` \| `null` \| `undefined` = `null`

***

### createdAt

> **createdAt**: `Date`

***

### createdTimestamp

> **createdTimestamp**: `number`

***

### hoist

> **hoist**: `boolean` = `false`

***

### icon

> **icon**: [`Attachment`](Attachment.md) \| `null` = `null`

***

### id

> `readonly` **id**: `string`

#### Inherited from

[`Base`](Base.md).[`id`](Base.md#id)

***

### name

> **name**: `string`

***

### rank

> **rank**: `number` = `0`

***

### serverId

> **serverId**: `string`

## Accessors

### permissions

#### Get Signature

> **get** **permissions**(): [`Permissions`](Permissions.md)

Permissions for this role

##### Returns

[`Permissions`](Permissions.md)

***

### server

#### Get Signature

> **get** **server**(): [`Server`](Server.md) \| `undefined`

The server this role belongs to.
Pulls dynamically from the cache to prevent massive memory duplication.

##### Returns

[`Server`](Server.md) \| `undefined`

## Methods

### \_clone()

> **\_clone**(): `this`

Helper to quickly clone a structure

#### Returns

`this`

#### Inherited from

[`Base`](Base.md).[`_clone`](Base.md#_clone)

***

### delete()

> **delete**(): `Promise`\<`void`\>

Deletes this Role from the server.

#### Returns

`Promise`\<`void`\>

#### Throws

If the role cannot be deleted (e.g., lack of permissions).

#### Example

```ts
// Delete a role by its ID
await role.delete();
```

***

### edit()

> **edit**(`options`): `Promise`\<`Role`\>

Edits the role with the given options. Only the fields provided in the options will be updated; all other fields will remain unchanged.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`RoleEditOptions`](../interfaces/RoleEditOptions.md) | The fields to update. |

#### Returns

`Promise`\<`Role`\>

A promise that resolves to the updated Role.

#### Throws

If invalid options or RoleResolvable are provided.

#### Throws

If the API request fails (e.g., lack of permissions).

#### Example

```ts
// Change the role's name and color
await role.edit({ name: "Senior Admin", color: "#FFD700" });

// Remove the custom color from the role
await role.edit({ color: null });
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

> **fetch**(`force?`): `Promise`\<`Role`\>

Fetches this role directly from the API to ensure data is up to date.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `force` | `boolean` | `true` | Whether to skip the cache check and force a direct API request. Defaults to false. |

#### Returns

`Promise`\<`Role`\>

A promise that resolves to the fetched Role object.

#### Throws

If an invalid RoleResolvable is provided.

#### Throws

If the API request fails (e.g., the role does not exist).

#### Example

```ts
// Refresh the role's data from the API
await role.fetch();
console.log(`Role updated, current name: ${role.name}`);
```

***

### setColor()

> **setColor**(`color`): `Promise`\<`Role`\>

Change the color for this role, it can be a HEX or CSS colours

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `color` | `string` \| `null` | The new color for the role |

#### Returns

`Promise`\<`Role`\>

A promise that resolves to this updated Role object.

#### Throws

If API request fails

#### Example

```ts
// Change the role's color
await role.setColour("#FF0000");
console.log(`Role's new color: ${role.color}`);

// Use CSS color linear-graident
await role.setColour("linear-gradient(90deg, #FF0000, #0000FF)");
console.log(`Role's new color: ${role.color}`);

// Remove the custom color from the role
await role.setColour(null);
console.log(`Role's color removed, current color: ${role.color}`);
```

***

### setHoist()

> **setHoist**(`hoist`): `Promise`\<`Role`\>

Change the hoist status for this role

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `hoist` | `boolean` | The new hoist status for the role |

#### Returns

`Promise`\<`Role`\>

A promise that resolves to this updated Role object.

#### Throws

If API request fails

#### Example

```ts
// Enable hoisting for the role
await role.setHoist(true);
console.log(`Role is now hoisted: ${role.hoist}`);
```

***

### setIcon()

> **setIcon**(`icon`): `Promise`\<`Role`\>

Edit the icon of this role

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `icon` | `string` \| [`AttachmentBuilder`](AttachmentBuilder.md) \| `null` | Autumn ID for the new icon, or null to remove the custom icon |

#### Returns

`Promise`\<`Role`\>

A promise that resolves to this updated Role object.

#### Throws

If API request fails

#### Example

```ts
// Set a new icon for the role
await role.setIcon("AUTUMN_ID_FOR_ICON");
console.log(`Role's new icon: ${role.icon}`);

// Use AttachmentBuilder to upload a new icon file
import { readFile } from "node:fs/promises";
const iconFile = await readFile("./a.jpg");
const attachment = new AttachmentBuilder(iconFile, "a.jpg");
await role.setIcon(attachment);
console.log(`Role's new icon: ${role.icon}`);
```

***

### setName()

> **setName**(`name`): `Promise`\<`Role`\>

Change the name for this role

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `name` | `string` | The new name for the role |

#### Returns

`Promise`\<`Role`\>

A promise that resolves to this updated Role object.

#### Throws

If API request fails.

#### Example

```ts
// Change the role's name
await role.setName("New Role Name");
console.log(`Role's new name: ${role.name}`);
```

***

### setPermissions()

> **setPermissions**(`options`): `Promise`\<`Role`\>

Updates the permissions for this role.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`RolePermissionOptions`](../interfaces/RolePermissionOptions.md) | The allow and deny permissions to set. |

#### Returns

`Promise`\<`Role`\>

A promise that resolves to the updated Role object.

#### Throws

If invalid options are provided.

#### Throws

If the API request fails.

#### Example

```ts
// Grant the role permission to manage channels and send messages
await role.setPermissions({
  allow: ["ManageChannel", "SendMessage"]
});
```

***

### setPosition()

> **setPosition**(`newPosition`): `Promise`\<`Role`\>

Updates the hierarchical position of this role.
Automatically reconstructs the role array and performs a bulk update.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `newPosition` | `number` | The new rank/position for this role (0-indexed). |

#### Returns

`Promise`\<`Role`\>

A promise that resolves to this updated Role object.

#### Throws

If API request fails.

#### Example

```ts
// Move this role to position 2 in the hierarchy
await role.setPosition(2);
console.log(`Role moved to rank: ${role.rank}`);
```

***

### toString()

> **toString**(): `string`

Returns the UUID string when the object is cast to a string.

#### Returns

`string`

#### Inherited from

[`Base`](Base.md).[`toString`](Base.md#tostring)
