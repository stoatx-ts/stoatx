# Class: GatewayManager

## Constructors

### Constructor

> **new GatewayManager**(`client`): `GatewayManager`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |

#### Returns

`GatewayManager`

## Methods

### connect()

> **connect**(`token`): `Promise`\<`void`\>

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `token` | `string` |

#### Returns

`Promise`\<`void`\>

***

### disconnect()

> **disconnect**(): `void`

#### Returns

`void`

***

### send()

> **send**(`payload`): `boolean`

Sends a message to the gateway. Usually you'd use a helper such as `channel.startTyping()` instead.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `payload` | [`GatewayClientMessage`](../type-aliases/GatewayClientMessage.md) | The message to send. |

#### Returns

`boolean`

`false` if the gateway isn't connected, so nothing was sent.

***

### setGatewayUrl()

> **setGatewayUrl**(`url`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `url` | `string` |

#### Returns

`void`
