# Class: WebhookClient

## Extends

- [`Client`](Client.md)

## Constructors

### Constructor

> **new WebhookClient**(`data`, `options?`): `WebhookClient`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | [`WebhookClientData`](../type-aliases/WebhookClientData.md) |
| `options` | [`ClientOptions`](../interfaces/ClientOptions.md) |

#### Returns

`WebhookClient`

#### Overrides

[`Client`](Client.md).[`constructor`](Client.md#constructor)

## Properties

### channels

> **channels**: [`ChannelManager`](ChannelManager.md)

#### Inherited from

[`Client`](Client.md).[`channels`](Client.md#channels)

***

### emojis

> **emojis**: [`EmojiManager`](EmojiManager.md)

#### Inherited from

[`Client`](Client.md).[`emojis`](Client.md#emojis)

***

### gateway

> **gateway**: [`GatewayManager`](GatewayManager.md)

#### Inherited from

[`Client`](Client.md).[`gateway`](Client.md#gateway)

***

### id

> `readonly` **id**: `string`

***

### options

> **options**: [`ClientOptions`](../interfaces/ClientOptions.md)

#### Inherited from

[`Client`](Client.md).[`options`](Client.md#options)

***

### rest

> **rest**: [`RESTManager`](RESTManager.md)

#### Inherited from

[`Client`](Client.md).[`rest`](Client.md#rest)

***

### servers

> **servers**: [`ServerManager`](ServerManager.md)

#### Inherited from

[`Client`](Client.md).[`servers`](Client.md#servers)

***

### sweepers

> **sweepers**: [`SweeperManager`](SweeperManager.md)

#### Inherited from

[`Client`](Client.md).[`sweepers`](Client.md#sweepers)

***

### token

> `readonly` **token**: `string`

***

### user

> **user**: [`ClientUser`](ClientUser.md) \| `null` = `null`

#### Inherited from

[`Client`](Client.md).[`user`](Client.md#user)

***

### users

> **users**: [`UserManager`](UserManager.md)

#### Inherited from

[`Client`](Client.md).[`users`](Client.md#users)

***

### voice

> `readonly` **voice**: [`VoiceManager`](VoiceManager.md)

#### Inherited from

[`Client`](Client.md).[`voice`](Client.md#voice)

## Methods

### delete()

> **delete**(): `Promise`\<`void`\>

Delete this webhook.

#### Returns

`Promise`\<`void`\>

***

### edit()

> **edit**(`data`): `Promise`\<\{ \}\>

Edit this webhook's name/avatar.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `data` | [`WebhookEditOptions`](../interfaces/WebhookEditOptions.md) |

#### Returns

`Promise`\<\{ \}\>

***

### emit()

> **emit**\<`K`\>(`event`, ...`args`): `boolean`

Synchronously calls each of the listeners registered for the event named
`eventName`, in the order they were registered, passing the supplied arguments
to each.

Returns `true` if the event had listeners, `false` otherwise.

```js
import { EventEmitter } from 'node:events';
const myEmitter = new EventEmitter();

// First listener
myEmitter.on('event', function firstListener() {
  console.log('Helloooo! first listener');
});
// Second listener
myEmitter.on('event', function secondListener(arg1, arg2) {
  console.log(`event with parameters ${arg1}, ${arg2} in second listener`);
});
// Third listener
myEmitter.on('event', function thirdListener(...args) {
  const parameters = args.join(', ');
  console.log(`event with parameters ${parameters} in third listener`);
});

console.log(myEmitter.listeners('event'));

myEmitter.emit('event', 1, 2, 3, 4, 5);

// Prints:
// [
//   [Function: firstListener],
//   [Function: secondListener],
//   [Function: thirdListener]
// ]
// Helloooo! first listener
// event with parameters 1, 2 in second listener
// event with parameters 1, 2, 3, 4, 5 in third listener
```

#### Type Parameters

| Type Parameter |
| ------ |
| `K` *extends* keyof [`ClientEvents`](../interfaces/ClientEvents.md) |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `event` | `K` |
| ...`args` | [`ClientEvents`](../interfaces/ClientEvents.md)\[`K`\] |

#### Returns

`boolean`

#### Since

v0.1.26

#### Inherited from

[`Client`](Client.md).[`emit`](Client.md#emit)

***

### fetch()

> **fetch**(): `Promise`\<\{ \}\>

Fetch this webhook's public info (name, avatar, channel).

#### Returns

`Promise`\<\{ \}\>

***

### login()

> **login**(`token`): `Promise`\<`any`\>

Connects the bot to the Stoat Gateway

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `token` | `string` |

#### Returns

`Promise`\<`any`\>

#### Inherited from

[`Client`](Client.md).[`login`](Client.md#login)

***

### on()

> **on**\<`K`\>(`event`, `listener`): `this`

Adds the `listener` function to the end of the listeners array for the
event named `eventName`. No checks are made to see if the `listener` has
already been added. Multiple calls passing the same combination of `eventName`
and `listener` will result in the `listener` being added, and called, multiple
times.

```js
server.on('connection', (stream) => {
  console.log('someone connected!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The
`emitter.prependListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.on('foo', () => console.log('a'));
myEE.prependListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

#### Type Parameters

| Type Parameter |
| ------ |
| `K` *extends* keyof [`ClientEvents`](../interfaces/ClientEvents.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `K` | - |
| `listener` | (...`args`) => `void` | The callback function |

#### Returns

`this`

#### Since

v0.1.101

#### Inherited from

[`Client`](Client.md).[`on`](Client.md#on)

***

### once()

> **once**\<`K`\>(`event`, `listener`): `this`

Adds a **one-time** `listener` function for the event named `eventName`. The
next time `eventName` is triggered, this listener is removed and then invoked.

```js
server.once('connection', (stream) => {
  console.log('Ah, we have our first user!');
});
```

Returns a reference to the `EventEmitter`, so that calls can be chained.

By default, event listeners are invoked in the order they are added. The
`emitter.prependOnceListener()` method can be used as an alternative to add the
event listener to the beginning of the listeners array.

```js
import { EventEmitter } from 'node:events';
const myEE = new EventEmitter();
myEE.once('foo', () => console.log('a'));
myEE.prependOnceListener('foo', () => console.log('b'));
myEE.emit('foo');
// Prints:
//   b
//   a
```

#### Type Parameters

| Type Parameter |
| ------ |
| `K` *extends* keyof [`ClientEvents`](../interfaces/ClientEvents.md) |

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `event` | `K` | - |
| `listener` | (...`args`) => `void` | The callback function |

#### Returns

`this`

#### Since

v0.3.0

#### Inherited from

[`Client`](Client.md).[`once`](Client.md#once)

***

### send()

> **send**(`contentOrOptions`): `Promise`\<[`Message`](Message.md)\>

Send a message through this webhook.

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `contentOrOptions` | `string` \| [`MessageOptions`](../interfaces/MessageOptions.md) |

#### Returns

`Promise`\<[`Message`](Message.md)\>
