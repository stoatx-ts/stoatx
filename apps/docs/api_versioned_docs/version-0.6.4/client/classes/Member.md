# Class: Member

Represents a member of a server on Stoat

## Extends

- [`Base`](Base.md)

## Constructors

### Constructor

> **new Member**(`client`, `data`, `serverId?`): `Member`

#### Parameters

| Parameter   | Type                  |
| ----------- | --------------------- |
| `client`    | [`Client`](Client.md) |
| `data`      | \{ \}                 |
| `serverId?` | `string`              |

#### Returns

`Member`

#### Overrides

[`Base`](Base.md).[`constructor`](Base.md#constructor)

## Properties

### avatar

> **avatar**: [`Attachment`](Attachment.md) \| `null` = `null`

---

### cachedAt

> **cachedAt**: `number`

#### Inherited from

[`Base`](Base.md).[`cachedAt`](Base.md#cachedat)

---

### canPublish

> **canPublish**: `boolean` = `false`

---

### canRecieve

> **canRecieve**: `boolean` = `false`

---

### client

> `protected` `readonly` **client**: [`Client`](Client.md)

#### Inherited from

[`Base`](Base.md).[`client`](Base.md#client)

---

### id

> `readonly` **id**: `string`

#### Inherited from

[`Base`](Base.md).[`id`](Base.md#id)

---

### joinedAt

> **joinedAt**: `Date`

---

### nickname

> **nickname**: `string` \| `null` = `null`

---

### roles

> **roles**: `MemberRoleManager`

---

### serverId

> **serverId**: `string`

---

### timeout

> **timeout**: `Date` \| `null` = `null`

## Accessors

### avatarURL

#### Get Signature

> **get** **avatarURL**(): `string` \| `null`

Get avatar URL for this member, or null if they don't have one.

##### Example

```ts
// Get a member's avatar URL
const avatarURL = member.avatarURL;
console.log(avatarURL); // https://cdn.stoat.chat/attachments/avatars/1234567890/avatar.png
```

##### Returns

`string` \| `null`

---

### permissions

#### Get Signature

> **get** **permissions**(): [`Permissions`](Permissions.md)

Calculates the member's total permissions using BigInt

##### Returns

[`Permissions`](Permissions.md)

---

### roleIds

#### Get Signature

> **get** **roleIds**(): `string`[]

Get member role IDs

##### Returns

`string`[]

---

### server

#### Get Signature

> **get** **server**(): [`Server`](Server.md) \| `undefined`

Gets the Server object this member belongs to

##### Returns

[`Server`](Server.md) \| `undefined`

---

### user

#### Get Signature

> **get** **user**(): [`User`](User.md) \| `undefined`

Gets the global User object for this member

##### Returns

[`User`](User.md) \| `undefined`

## Methods

### \_clone()

> **\_clone**(): `this`

Helper to quickly clone a structure

#### Returns

`this`

#### Inherited from

[`Base`](Base.md).[`_clone`](Base.md#_clone)

---

### \_patch()

> **\_patch**(`data`): `void`

#### Parameters

| Parameter | Type  |
| --------- | ----- |
| `data`    | \{ \} |

#### Returns

`void`

---

### ban()

> **ban**(`options?`): `Promise`\<`void`\>

Ban this member from the server.

#### Parameters

| Parameter  | Type                                                    | Description              |
| ---------- | ------------------------------------------------------- | ------------------------ |
| `options?` | [`MemberBanOptions`](../interfaces/MemberBanOptions.md) | The options for this ban |

#### Returns

`Promise`\<`void`\>

#### Example

```ts
// Ban a member with a reason and delete their messages from the last hour
await member.ban({ reason: "Spamming", deleteMessageSeconds: 3600 });
```

---

### createDM()

> **createDM**(`force?`): `Promise`\<`void`\>

Creates a DM channel between the client's user and this member.

#### Parameters

| Parameter | Type      | Default value | Description                                                                  |
| --------- | --------- | ------------- | ---------------------------------------------------------------------------- |
| `force`   | `boolean` | `false`       | If true, forces the creation of a new DM channel even if one already exists. |

#### Returns

`Promise`\<`void`\>

A promise that resolves to the created DMChannel object.

#### Throws

If the API request fails.

#### Example

```ts
// Create a DM with this member
const dm = await member.createDM();
console.log(`DM channel ID: ${dm.id}`);
```

---

### edit()

> **edit**(`options`): `Promise`\<`Member`\>

Edit this member.

#### Parameters

| Parameter | Type                                                      | Description                                                          |
| --------- | --------------------------------------------------------- | -------------------------------------------------------------------- |
| `options` | [`MemberEditOptions`](../interfaces/MemberEditOptions.md) | The options to edit the member with (nickname, roles, timeout, etc.) |

#### Returns

`Promise`\<`Member`\>

A promise that resolves to the updated Member.

---

### equals()

> **equals**(`other`): `boolean`

Compares this object with another to see if they represent the same entity.

#### Parameters

| Parameter | Type                          |
| --------- | ----------------------------- |
| `other`   | `string` \| [`Base`](Base.md) |

#### Returns

`boolean`

#### Inherited from

[`Base`](Base.md).[`equals`](Base.md#equals)

---

### kick()

> **kick**(): `Promise`\<`void`\>

Kick this member from the server.

#### Returns

`Promise`\<`void`\>

---

### send()

> **send**(`options`): `Promise`\<[`Message`](Message.md)\>

Send a message to this member.

#### Parameters

| Parameter | Type                                                            | Description                                     |
| --------- | --------------------------------------------------------------- | ----------------------------------------------- |
| `options` | `string` \| [`MessageOptions`](../interfaces/MessageOptions.md) | The content or options for the message to send. |

#### Returns

`Promise`\<[`Message`](Message.md)\>

A promise that resolves to the sent Message object.

#### Throws

If the API request fails.

#### Example

```ts
// Send a message to this member
const message = await member.send("Hello!");
console.log(`Sent message ID: ${message.id}`);
```

---

### setNickname()

> **setNickname**(`nickname`): `Promise`\<`Member`\>

#### Parameters

| Parameter  | Type     |
| ---------- | -------- |
| `nickname` | `string` |

#### Returns

`Promise`\<`Member`\>

---

### setTimeout()

> **setTimeout**(`duration`): `Promise`\<`void`\>

Timeout this member for a specified duration.

#### Parameters

| Parameter  | Type     | Description                                  |
| ---------- | -------- | -------------------------------------------- |
| `duration` | `number` | The duration of the timeout in milliseconds. |

#### Returns

`Promise`\<`void`\>

#### Example

```ts
// Timeout a member for 10 minutes (600,000 milliseconds)
await member.setTimeout(600000);
```

---

### toString()

> **toString**(): `string`

When concatenated with a string, this automatically returns the user's mention instead of the GuildMember object.

#### Returns

`string`

#### Example

```ts
// Logs: Hello from <@01JE2MM759J5D7CHJF084R7MJ2>!
console.log(`Hello from ${member}!`);
```

#### Overrides

[`Base`](Base.md).[`toString`](Base.md#tostring)
