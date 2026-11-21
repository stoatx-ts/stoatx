# Class: VoiceManager

Joins voice calls from Node.js, e.g. for a music bot. Play audio into a call with an
`AudioPlayer`.

## Example

```ts
import { VoiceManager, AudioPlayer, AudioResource } from "@stoatx/voice-node";

const voice = new VoiceManager(client);
const connection = await voice.join(channel);

const player = new AudioPlayer();
connection.subscribe(player);
player.play(AudioResource.from("./song.mp3"));
```

## Extends

- `BaseVoiceManager`\<[`VoiceConnection`](VoiceConnection.md)\>

## Constructors

### Constructor

> **new VoiceManager**(`client`): `VoiceManager`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | `Client` | The client to join calls with. |

#### Returns

`VoiceManager`

#### Overrides

`BaseVoiceManager<VoiceConnection>.constructor`

## Properties

### client

> `readonly` **client**: `Client`

The client the calls are joined with.

#### Inherited from

`BaseVoiceManager.client`

## Accessors

### cache

#### Get Signature

> **get** **cache**(): `ReadonlyMap`\<`string`, `C`\>

Every call the client is in, by channel ID.

##### Returns

`ReadonlyMap`\<`string`, `C`\>

#### Inherited from

`BaseVoiceManager.cache`

## Methods

### fetchNodes()

> **fetchNodes**(): `Promise`\<[`VoiceNode`](../interfaces/VoiceNode.md)[]\>

Fetches the instance's voice servers. Cached after the first call.

#### Returns

`Promise`\<[`VoiceNode`](../interfaces/VoiceNode.md)[]\>

The nodes, empty if the instance has voice turned off.

#### Inherited from

`BaseVoiceManager.fetchNodes`

***

### get()

> **get**(`channel`): [`VoiceConnection`](VoiceConnection.md) \| `undefined`

Gets the connection to a channel's call.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`VoiceChannelResolvable`](../type-aliases/VoiceChannelResolvable.md) | The channel or its ID. |

#### Returns

[`VoiceConnection`](VoiceConnection.md) \| `undefined`

The connection, or `undefined` if the client isn't in that call.

#### Inherited from

`BaseVoiceManager.get`

***

### join()

> **join**(`channel`, `options?`): `Promise`\<[`VoiceConnection`](VoiceConnection.md)\>

Joins a voice channel's call. Joining a channel the client is already in returns the existing
connection, and joining while a join is in progress waits for it.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`VoiceChannelResolvable`](../type-aliases/VoiceChannelResolvable.md) | The voice channel, DM or group, or its ID. |
| `options?` | [`VoiceJoinOptions`](../interfaces/VoiceJoinOptions.md) | Whether to disconnect other devices, who to ring, and which voice node to use. Ignored when the client is already in the call. |

#### Returns

`Promise`\<[`VoiceConnection`](VoiceConnection.md)\>

The connection, once it's ready.

#### Throws

If the API refuses, e.g. `MissingPermission` without the Connect permission.

#### Example

```ts
const connection = await voice.join(channel);
connection.on("disconnect", () => console.log("Left the call"));
```

#### Inherited from

`BaseVoiceManager.join`

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

#### Inherited from

`BaseVoiceManager.leave`

***

### leaveAll()

> **leaveAll**(): `Promise`\<`void`\>

Leaves every call.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`BaseVoiceManager.leaveAll`
