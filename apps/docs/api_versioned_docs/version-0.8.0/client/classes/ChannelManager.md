# Class: ChannelManager

## Extends

- `BaseManager`\<`string`, [`BaseChannel`](BaseChannel.md)\>

## Constructors

### Constructor

> **new ChannelManager**(`client`, `limit?`): `ChannelManager`

Manages API methods and caching for all channels globally.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | `undefined` | The active Client instance. |
| `limit` | `number` | `Infinity` | The maximum number of channels to hold in the cache. |

#### Returns

`ChannelManager`

#### Overrides

`BaseManager<string, BaseChannel>.constructor`

## Properties

### cache

> **cache**: [`Collection`](Collection.md)\<`string`, [`BaseChannel`](BaseChannel.md)\>

#### Inherited from

`BaseManager.cache`

***

### client

> **client**: [`Client`](Client.md)

#### Inherited from

`BaseManager.client`

## Methods

### bulkDelete()

> **bulkDelete**(`id`, `messages`): `Promise`\<`void`\>

Bulk delete up to 100 messages

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | Channel ID |
| `messages` | [`MessageResolvable`](../type-aliases/MessageResolvable.md)[] | An array of MessageResolvable |

#### Returns

`Promise`\<`void`\>

#### Throws

If the API request fails

#### Example

```ts
await client.channels.bulkDelete("CHANNEL_ID", ["MESSAGE_ID_1", "MESSAGE_ID_2", "MESSAGE_ID_3"]);
```

***

### delete()

> **delete**(`channel`): `Promise`\<`void`\>

Deletes a server channel, leaves a group, or closes a DM.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`ChannelResolvable`](../type-aliases/ChannelResolvable.md) | The channel object, raw ID, or mention string to delete. |

#### Returns

`Promise`\<`void`\>

A promise that resolves when the action is successful.

#### Throws

If the API request fails.

#### Example

```ts
await client.channels.delete("01H...");
```

***

### edit()

> **edit**(`channel`, `options`): `Promise`\<[`BaseChannel`](BaseChannel.md)\>

Edits a channel in the server.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`ChannelResolvable`](../type-aliases/ChannelResolvable.md) | The ChannelResolvable to edit. |
| `options` | [`ChannelEditOptions`](../interfaces/ChannelEditOptions.md) | The fields to update. |

#### Returns

`Promise`\<[`BaseChannel`](BaseChannel.md)\>

A promise that resolves to the updated BaseChannel.

#### Throws

If invalid options or ChannelResolvable are provided.

#### Throws

If the API request fails.

#### Example

```ts
// Update channel name and remove its description
await client.channels.edit("01H...", { name: "general", description: null });
```

***

### fetch()

> **fetch**(`channel`, `force?`): `Promise`\<[`BaseChannel`](BaseChannel.md)\>

Fetches a Channel from the API or resolves it from the local cache.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `channel` | [`ChannelResolvable`](../type-aliases/ChannelResolvable.md) | `undefined` | The ID, mention, or Channel object to fetch. |
| `force` | `boolean` | `false` | Whether to skip the cache check and force a direct API request. Defaults to false. |

#### Returns

`Promise`\<[`BaseChannel`](BaseChannel.md)\>

A promise that resolves to the fetched BaseChannel object.

#### Throws

If an invalid ChannelResolvable is provided.

#### Throws

If the API request fails.

#### Example

```ts
// Fetch a channel, bypassing cache
const channel = await client.channels.fetch("01H...");
```

***

### pin()

> **pin**(`id`, `messageId`): `Promise`\<`void`\>

Pin a message

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | Channel ID |
| `messageId` | `string` | Message ID |

#### Returns

`Promise`\<`void`\>

#### Throws

If the API request fails.

#### Example

```ts
await client.channels.pin("CHANNEL_ID", "MESSAGE_ID");
```

***

### resolve()

> **resolve**(`channel`): [`BaseChannel`](BaseChannel.md) \| `undefined`

Resolves a ChannelResolvable to a cached BaseChannel object.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`ChannelResolvable`](../type-aliases/ChannelResolvable.md) | The ChannelResolvable to resolve. |

#### Returns

[`BaseChannel`](BaseChannel.md) \| `undefined`

The resolved BaseChannel, or undefined if not cached.

***

### resolveDM()

> **resolveDM**(`channel`): [`DMChannel`](DMChannel.md) \| `undefined`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `channel` | [`ChannelResolvable`](../type-aliases/ChannelResolvable.md) |

#### Returns

[`DMChannel`](DMChannel.md) \| `undefined`

***

### resolveGroup()

> **resolveGroup**(`channel`): [`GroupChannel`](GroupChannel.md) \| `undefined`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `channel` | [`ChannelResolvable`](../type-aliases/ChannelResolvable.md) |

#### Returns

[`GroupChannel`](GroupChannel.md) \| `undefined`

***

### resolveId()

> **resolveId**(`channel`): `string`

Extracts ID from a ChannelResolvable.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`ChannelResolvable`](../type-aliases/ChannelResolvable.md) | The ChannelResolvable to extract the ID from. |

#### Returns

`string`

The extracted channel ID.

#### Throws

If an invalid type is provided.

***

### resolveText()

> **resolveText**(`channel`): [`TextChannel`](TextChannel.md) \| `undefined`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `channel` | [`ChannelResolvable`](../type-aliases/ChannelResolvable.md) |

#### Returns

[`TextChannel`](TextChannel.md) \| `undefined`

***

### setDefaultPermissions()

> **setDefaultPermissions**(`channel`, `permissions`): `Promise`\<[`BaseChannel`](BaseChannel.md)\>

Updates the default (everyone) permissions for a channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`ChannelResolvable`](../type-aliases/ChannelResolvable.md) | The ChannelResolvable to update permissions for. |
| `permissions` | [`PermissionResolvable`](../type-aliases/PermissionResolvable.md) | The default permissions to grant globally in this channel. |

#### Returns

`Promise`\<[`BaseChannel`](BaseChannel.md)\>

A promise that resolves to the updated BaseChannel.

#### Throws

If invalid permissions are provided.

#### Throws

If the API request fails.

#### Example

```ts
// Set the default permission to allow everyone to view the channel
await client.channels.setDefaultPermissions(channel, ["ViewChannel", "ReadMessageHistory"]);
```

***

### setRolePermissions()

> **setRolePermissions**(`channel`, `roleId`, `options`): `Promise`\<[`BaseChannel`](BaseChannel.md)\>

Updates the permission overrides for a specific role in a channel.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`ChannelResolvable`](../type-aliases/ChannelResolvable.md) | The ChannelResolvable to update permissions for. |
| `roleId` | `string` | The raw string ID of the role to update. |
| `options` | [`ChannelRolePermissionOptions`](../interfaces/ChannelRolePermissionOptions.md) | The allow and deny permissions to set. |

#### Returns

`Promise`\<[`BaseChannel`](BaseChannel.md)\>

A promise that resolves to the updated BaseChannel.

#### Throws

If the channel is not a Server Channel, or options are invalid.

#### Throws

If the API request fails.

#### Example

```ts
// Deny a role the ability to send messages in this channel
await client.channels.setRolePermissions(channel, "ROLE_ID", { deny: ["SendMessage"] });
```

***

### unpin()

> **unpin**(`id`, `messageId`): `Promise`\<`void`\>

Unpin a message

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | Channel ID |
| `messageId` | `string` | Message ID |

#### Returns

`Promise`\<`void`\>

#### Throws

If the API request fails

#### Example

```ts
await client.channels.unpin("CHANNEL_ID", "MESSAGE_ID");
```
