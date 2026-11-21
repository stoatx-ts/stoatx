# Class: VoiceManager

Joins voice calls in the browser, with the user's microphone and speakers.

## Example

```ts
import { VoiceManager } from "@stoatx/voice-browser";

const voice = new VoiceManager(client);
const connection = await voice.join(channel);

// From the mute button's click handler: asks for microphone permission the first time.
await connection.setMicrophoneEnabled(true);
```

## Extends

- `BaseVoiceManager`\<[`VoiceConnection`](VoiceConnection.md)\>

## Constructors

### Constructor

> **new VoiceManager**(`client`, `options?`): `VoiceManager`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | `Client` | The client to join calls with. |
| `options` | [`BrowserVoiceOptions`](../interfaces/BrowserVoiceOptions.md) | Applied to every connection, e.g. where to put the audio elements. |

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

> **join**(`channel`): `Promise`\<[`VoiceConnection`](VoiceConnection.md)\>

Joins a voice channel's call. Joining a channel the client is already in returns the existing
connection, and joining while a join is in progress waits for it.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`VoiceChannelResolvable`](../type-aliases/VoiceChannelResolvable.md) | The voice channel, DM or group, or its ID. |

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
