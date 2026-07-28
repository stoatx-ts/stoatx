# Class: AudioPlayer

## Extends

- `EventEmitter`\<[`AudioPlayerEvents`](../interfaces/AudioPlayerEvents.md)\>

## Constructors

### Constructor

> **new AudioPlayer**(`options?`): `AudioPlayer`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options?` | `EventEmitterOptions` |

#### Returns

`AudioPlayer`

#### Inherited from

`EventEmitter<AudioPlayerEvents>.constructor`

## Accessors

### resource

#### Get Signature

> **get** **resource**(): [`AudioResource`](AudioResource.md) \| `null`

##### Returns

[`AudioResource`](AudioResource.md) \| `null`

***

### status

#### Get Signature

> **get** **status**(): [`AudioPlayerStatus`](../type-aliases/AudioPlayerStatus.md)

##### Returns

[`AudioPlayerStatus`](../type-aliases/AudioPlayerStatus.md)

## Methods

### pause()

> **pause**(): `void`

#### Returns

`void`

***

### play()

> **play**(`resource`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `resource` | [`AudioResource`](AudioResource.md) |

#### Returns

`void`

***

### resume()

> **resume**(): `void`

#### Returns

`void`

***

### stop()

> **stop**(): `void`

#### Returns

`void`
