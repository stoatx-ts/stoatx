# Class: BaseVoiceManager\<C\>

Joins and tracks voice calls, one connection per channel. Use the `VoiceManager` from
`@stoatx/voice-node` or `@stoatx/voice-browser`, which extend this with their connection type.

## Type Parameters

| Type Parameter | Default type |
| ------ | ------ |
| `C` *extends* [`BaseVoiceConnection`](BaseVoiceConnection.md) | [`BaseVoiceConnection`](BaseVoiceConnection.md) |

## Constructors

### Constructor

> **new BaseVoiceManager**\<`C`\>(`client`, `createConnection`): `BaseVoiceManager`\<`C`\>

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | `Client` | The client to join calls with. |
| `createConnection` | [`VoiceConnectionFactory`](../type-aliases/VoiceConnectionFactory.md)\<`C`\> | Creates the platform's connection for a channel. |

#### Returns

`BaseVoiceManager`\<`C`\>

## Properties

### client

> `readonly` **client**: `Client`

The client the calls are joined with.

## Accessors

### cache

#### Get Signature

> **get** **cache**(): `ReadonlyMap`\<`string`, `C`\>

Every call the client is in, by channel ID.

##### Returns

`ReadonlyMap`\<`string`, `C`\>

## Methods

### get()

> **get**(`channel`): `C` \| `undefined`

Gets the connection to a channel's call.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`VoiceChannelResolvable`](../type-aliases/VoiceChannelResolvable.md) | The channel or its ID. |

#### Returns

`C` \| `undefined`

The connection, or `undefined` if the client isn't in that call.

***

### join()

> **join**(`channel`): `Promise`\<`C`\>

Joins a voice channel's call. Joining a channel the client is already in returns the existing
connection, and joining while a join is in progress waits for it.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`VoiceChannelResolvable`](../type-aliases/VoiceChannelResolvable.md) | The voice channel, DM or group, or its ID. |

#### Returns

`Promise`\<`C`\>

The connection, once it's ready.

#### Throws

If the API refuses, e.g. `MissingPermission` without the Connect permission.

#### Example

```ts
const connection = await voice.join(channel);
connection.on("disconnect", () => console.log("Left the call"));
```

***

### leave()

> **leave**(`channel`): `Promise`\<`void`\>

Leaves a channel's call. Does nothing if the client isn't in it.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`VoiceChannelResolvable`](../type-aliases/VoiceChannelResolvable.md) | The channel or its ID. |

#### Returns

`Promise`\<`void`\>

***

### leaveAll()

> **leaveAll**(): `Promise`\<`void`\>

Leaves every call.

#### Returns

`Promise`\<`void`\>
