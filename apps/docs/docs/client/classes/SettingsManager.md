# Class: SettingsManager

Settings synced between the user's devices, such as theme or notification preferences
(user sessions only). Available as `client.settings`.

Stoat stores each setting as a string under a key, without looking at it, so apps can
pick their own keys and formats. Most store JSON, which [getJSON](#getjson) and [set](#set) handle.

The cache is kept up to date from the user's other devices. Listen to `settingsUpdate` to react.

## Example

```ts
await client.settings.fetch(["appearance"]);
const appearance = client.settings.getJSON<{ theme: string }>("appearance");

await client.settings.set({ appearance: { theme: "dark" } });
```

## Constructors

### Constructor

> **new SettingsManager**(`client`): `SettingsManager`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | The client this manager belongs to. |

#### Returns

`SettingsManager`

## Properties

### cache

> `readonly` **cache**: [`Collection`](Collection.md)\<`string`, [`SyncedSetting`](../interfaces/SyncedSetting.md)\>

Settings loaded so far, by key.

## Methods

### fetch()

> **fetch**(`keys`): `Promise`\<[`Collection`](Collection.md)\<`string`, [`SyncedSetting`](../interfaces/SyncedSetting.md)\>\>

Loads settings from the server into the cache.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `keys` | `string`[] | The keys to load. Keys that don't exist are left out of the result. |

#### Returns

`Promise`\<[`Collection`](Collection.md)\<`string`, [`SyncedSetting`](../interfaces/SyncedSetting.md)\>\>

The loaded settings, by key.

***

### get()

> **get**(`key`): `string` \| `undefined`

Gets a setting's raw value from the cache.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The setting's key. |

#### Returns

`string` \| `undefined`

The value, or `undefined` if it isn't loaded or doesn't exist.

***

### getJSON()

> **getJSON**\<`T`\>(`key`): `T` \| `undefined`

Gets a setting from the cache and parses it as JSON.

#### Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `T` | `unknown` |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `key` | `string` | The setting's key. |

#### Returns

`T` \| `undefined`

The parsed value, or `undefined` if it isn't loaded, doesn't exist, or isn't valid JSON.

***

### set()

> **set**(`settings`): `Promise`\<`void`\>

Saves settings and syncs them to the user's other devices. Strings are stored as-is;
anything else is stored as JSON. Keys that aren't passed are left unchanged.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `settings` | `Record`\<`string`, `unknown`\> | The settings to save, by key. |

#### Returns

`Promise`\<`void`\>

#### Example

```ts
await client.settings.set({ appearance: { theme: "dark" }, locale: JSON.stringify("en") });
```
