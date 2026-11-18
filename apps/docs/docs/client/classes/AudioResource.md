# Class: AudioResource

## Properties

### stream

> `readonly` **stream**: `Readable`

## Methods

### destroy()

> **destroy**(): `void`

Stops decoding: destroys the output stream and kills the ffmpeg process.
Safe to call more than once.

#### Returns

`void`

***

### from()

> `static` **from**(`source`, `options?`): `AudioResource`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `source` | [`AudioSource`](../type-aliases/AudioSource.md) |
| `options` | [`AudioResourceOptions`](../interfaces/AudioResourceOptions.md) |

#### Returns

`AudioResource`
