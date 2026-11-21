# Class: WebhookManager

## Extends

- [`BaseManager`](BaseManager.md)\<`string`, [`Webhook`](Webhook.md), `APIWebhook`\>

## Constructors

### Constructor

> **new WebhookManager**(`client`, `channel`, `limit?`): `WebhookManager`

#### Parameters

| Parameter | Type | Default value |
| ------ | ------ | ------ |
| `client` | [`Client`](Client.md) | `undefined` |
| `channel` | [`BaseChannel`](BaseChannel.md) | `undefined` |
| `limit` | `number` | `Infinity` |

#### Returns

`WebhookManager`

#### Overrides

[`BaseManager`](BaseManager.md).[`constructor`](BaseManager.md#constructor)

## Properties

### cache

> **cache**: [`Collection`](Collection.md)\<`string`, [`Webhook`](Webhook.md)\>

#### Inherited from

[`BaseManager`](BaseManager.md).[`cache`](BaseManager.md#cache)

***

### channel

> **channel**: [`BaseChannel`](BaseChannel.md)

***

### client

> **client**: [`Client`](Client.md)

#### Inherited from

[`BaseManager`](BaseManager.md).[`client`](BaseManager.md#client)

## Methods

### construct()

> `protected` **construct**(`data`): [`Webhook`](Webhook.md)

Tell BaseManager how to build a Webhook

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |

#### Returns

[`Webhook`](Webhook.md)

#### Overrides

`BaseManager.construct`

***

### create()

> **create**(`options`): `Promise`\<[`Webhook`](Webhook.md)\>

Creates a new webhook in this channel.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`WebhookCreateOptions`](../interfaces/WebhookCreateOptions.md) |

#### Returns

`Promise`\<[`Webhook`](Webhook.md)\>

#### Example

```ts
const webhook = await channel.webhooks.create({ name: "Deploy Bot" });
```

***

### delete()

> **delete**(`webhook`): `Promise`\<`void`\>

Delete a webhook by object or ID (bot auth).

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `webhook` | [`WebhookResolvable`](../type-aliases/WebhookResolvable.md) |

#### Returns

`Promise`\<`void`\>

***

### extractId()

> `protected` **extractId**(`data`): `string`

Tell BaseManager how to find the ID for Webhooks

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | \{ \} |

#### Returns

`string`

#### Overrides

`BaseManager.extractId`

***

### fetch()

#### Call Signature

> **fetch**(`id`, `token`): `Promise`\<[`Webhook`](Webhook.md)\>

Fetch a webhook using its ID and token

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | The ID of the webhook |
| `token` | `string` | The token of the webhook |

##### Returns

`Promise`\<[`Webhook`](Webhook.md)\>

#### Call Signature

> **fetch**(`id`): `Promise`\<\{ \}\>

Fetch a webhook using its ID

##### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `id` | `string` | The ID of the webhook |

##### Returns

`Promise`\<\{ \}\>

***

### fetchMany()

> **fetchMany**(): `Promise`\<[`Collection`](Collection.md)\<`string`, [`Webhook`](Webhook.md)\>\>

Lists all webhooks for this channel (bot auth).

#### Returns

`Promise`\<[`Collection`](Collection.md)\<`string`, [`Webhook`](Webhook.md)\>\>

***

### resolveId()

> **resolveId**(`webhook`): `string`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `webhook` | [`WebhookResolvable`](../type-aliases/WebhookResolvable.md) |

#### Returns

`string`
