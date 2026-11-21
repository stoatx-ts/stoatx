# Class: VoiceStateManager

Who's in which voice call. Loaded when the client connects and kept up to date from gateway
events, so it works without joining any call. Available as `client.voiceStates`.

## Constructors

### Constructor

> **new VoiceStateManager**(`client`): `VoiceStateManager`

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | The client this manager belongs to. |

#### Returns

`VoiceStateManager`

## Properties

### cache

> `readonly` **cache**: [`Collection`](Collection.md)\<`string`, [`Collection`](Collection.md)\<`string`, [`VoiceState`](VoiceState.md)\>\>

Voice states by channel ID, then user ID. Channels with nobody in a call have no entry.

## Methods

### get()

> **get**(`channel`): [`Collection`](Collection.md)\<`string`, [`VoiceState`](VoiceState.md)\>

Gets everyone in a channel's call.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channel` | [`ChannelResolvable`](../type-aliases/ChannelResolvable.md) | The channel or its ID. |

#### Returns

[`Collection`](Collection.md)\<`string`, [`VoiceState`](VoiceState.md)\>

Their voice states by user ID. Empty if nobody is in the call.

***

### getUser()

> **getUser**(`user`): [`VoiceState`](VoiceState.md) \| `undefined`

Finds the call a user is in.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `user` | [`UserResolvable`](../type-aliases/UserResolvable.md) | The user or their ID. |

#### Returns

[`VoiceState`](VoiceState.md) \| `undefined`

Their voice state, or `undefined` if they aren't in a call the client can see.
