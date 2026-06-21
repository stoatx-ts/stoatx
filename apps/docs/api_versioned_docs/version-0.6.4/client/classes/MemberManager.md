# Class: MemberManager

## Extends

- `BaseManager`\<`string`, [`Member`](Member.md)\>

## Constructors

### Constructor

> **new MemberManager**(`client`, `server`, `limit?`): `MemberManager`

#### Parameters

| Parameter | Type                  | Default value |
| --------- | --------------------- | ------------- |
| `client`  | [`Client`](Client.md) | `undefined`   |
| `server`  | [`Server`](Server.md) | `undefined`   |
| `limit`   | `number`              | `Infinity`    |

#### Returns

`MemberManager`

#### Overrides

`BaseManager<string, Member>.constructor`

## Properties

### cache

> **cache**: [`Collection`](Collection.md)\<`string`, [`Member`](Member.md)\>

#### Inherited from

`BaseManager.cache`

---

### client

> **client**: [`Client`](Client.md)

#### Inherited from

`BaseManager.client`

---

### server

> **server**: [`Server`](Server.md)

## Methods

### \[custom\]()

> **\[custom\]**(): [`Collection`](Collection.md)\<`string`, [`Member`](Member.md)\>

#### Returns

[`Collection`](Collection.md)\<`string`, [`Member`](Member.md)\>

---

### ban()

> **ban**(`member`, `options?`): `Promise`\<`void`\>

Bans a member from the server.

#### Parameters

| Parameter  | Type                                                      | Description                  |
| ---------- | --------------------------------------------------------- | ---------------------------- |
| `member`   | [`MemberResolvable`](../type-aliases/MemberResolvable.md) | The MemberResolvable to ban. |
| `options?` | [`MemberBanOptions`](../interfaces/MemberBanOptions.md)   | The ban options              |

#### Returns

`Promise`\<`void`\>

#### Example

```ts
// Ban a member by ID
await server.members.ban("1234567890", { reason: "Spamming", deleteMessageSeconds: 3600 });
```

---

### edit()

> **edit**(`member`, `options`): `Promise`\<[`Member`](Member.md)\>

Edits a member in the server.

#### Parameters

| Parameter | Type                                                      | Description                                            |
| --------- | --------------------------------------------------------- | ------------------------------------------------------ |
| `member`  | [`MemberResolvable`](../type-aliases/MemberResolvable.md) | The MemberResolvable to edit.                          |
| `options` | [`MemberEditOptions`](../interfaces/MemberEditOptions.md) | The fields to update (nickname, roles, timeout, etc.). |

#### Returns

`Promise`\<[`Member`](Member.md)\>

A promise that resolves to the updated Member.

#### Throws

If the API request fails or the member is not found.

#### Example

```ts
// Change a member's nickname and add a role
const updatedMember = await server.members.edit("1234567890", {
  nickname: "New Nickname",
  roles: ["roleId1", "roleId2"],
});
```

---

### fetch()

> **fetch**(`member`, `force?`): `Promise`\<[`Member`](Member.md)\>

Fetches a member from the server, or returns the cached version if available and not forced.

#### Parameters

| Parameter | Type                                                      | Default value | Description                                                   |
| --------- | --------------------------------------------------------- | ------------- | ------------------------------------------------------------- |
| `member`  | [`MemberResolvable`](../type-aliases/MemberResolvable.md) | `undefined`   | The MemberResolvable to fetch                                 |
| `force`   | `boolean`                                                 | `false`       | Whether to bypass the cache and fetch fresh data from the API |

#### Returns

`Promise`\<[`Member`](Member.md)\>

A promise that resolves to the fetched Member

#### Throws

If the API request fails or the member is not found

#### Example

```ts
// Fetch a member by ID, using cache if available
const member = await server.members.fetch("1234567890");

// Fetch a member by mention, bypassing cache
const member = await server.members.fetch("<@1234567890>", true);
```

---

### fetchMany()

> **fetchMany**(`options?`): `Promise`\<[`Collection`](Collection.md)\<`string`, [`Member`](Member.md)\>\>

Fetches multiple members from the server.

#### Parameters

| Parameter | Type                                                          | Description                           |
| --------- | ------------------------------------------------------------- | ------------------------------------- |
| `options` | [`FetchMembersOptions`](../interfaces/FetchMembersOptions.md) | Filter options for the fetch request. |

#### Returns

`Promise`\<[`Collection`](Collection.md)\<`string`, [`Member`](Member.md)\>\>

A promise that resolves to a Collection of fetched Members.

#### Throws

If the API request fails.

#### Example

```ts
// Fetch all members in the server
const allMembers = await server.members.fetchMany();

// Fetch only online members to save bandwidth
const onlineMembers = await server.members.fetchMany({ exclude_offline: true });
```

---

### kick()

> **kick**(`member`): `Promise`\<`void`\>

Kicks a member from the server.

#### Parameters

| Parameter | Type                                                      | Description                   |
| --------- | --------------------------------------------------------- | ----------------------------- |
| `member`  | [`MemberResolvable`](../type-aliases/MemberResolvable.md) | The MemberResolvable to kick. |

#### Returns

`Promise`\<`void`\>

#### Example

```ts
// Kick a member by ID
await server.members.kick("1234567890");
```

---

### resolve()

> **resolve**(`member`): [`Member`](Member.md) \| `undefined`

Resolve a string or mention to Member

#### Parameters

| Parameter | Type                                                      | Description                     |
| --------- | --------------------------------------------------------- | ------------------------------- |
| `member`  | [`MemberResolvable`](../type-aliases/MemberResolvable.md) | The MemberResolvable to resolve |

#### Returns

[`Member`](Member.md) \| `undefined`

The resolved Member or undefined if not found

---

### resolveId()

> **resolveId**(`member`): `string`

Resolve a Member to their ID string.

#### Parameters

| Parameter | Type                                                      | Description                     |
| --------- | --------------------------------------------------------- | ------------------------------- |
| `member`  | [`MemberResolvable`](../type-aliases/MemberResolvable.md) | The MemberResolvable to resolve |

#### Returns

`string`

The resolved ID string

#### Throws

If the provided resolvable is invalid

---

### unban()

> **unban**(`member`): `Promise`\<`void`\>

Unbans a user from the server

#### Parameters

| Parameter | Type                                                      | Description                   |
| --------- | --------------------------------------------------------- | ----------------------------- |
| `member`  | [`MemberResolvable`](../type-aliases/MemberResolvable.md) | The MemberResolvable to unban |

#### Returns

`Promise`\<`void`\>

#### Example

```ts
// Unban a member by ID
await server.members.unban("1234567890");
```
