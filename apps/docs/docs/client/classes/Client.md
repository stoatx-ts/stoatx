# Class: Client

## Extends

- `EventEmitter`

## Constructors

### Constructor

> **new Client**(`options?`): `Client`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `options` | [`ClientOptions`](../interfaces/ClientOptions.md) |

#### Returns

`Client`

#### Overrides

`EventEmitter.constructor`

## Properties

### auth

> **auth**: [`AuthManager`](AuthManager.md)

Sessions, logout and onboarding for user accounts.

***

### channels

> **channels**: [`ChannelManager`](ChannelManager.md)

***

### emojis

> **emojis**: [`EmojiManager`](EmojiManager.md)

***

### gateway

> **gateway**: [`GatewayManager`](GatewayManager.md)

***

### options

> **options**: [`ClientOptions`](../interfaces/ClientOptions.md)

***

### rest

> **rest**: [`RESTManager`](RESTManager.md)

***

### servers

> **servers**: [`ServerManager`](ServerManager.md)

***

### sweepers

> **sweepers**: [`SweeperManager`](SweeperManager.md)

***

### unreads

> **unreads**: [`UnreadManager`](UnreadManager.md)

Which channels the logged-in user has read (user sessions only). Most code uses `channel.unread` and `channel.ack()` instead.

***

### user

> **user**: [`ClientUser`](ClientUser.md) \| `null` = `null`

***

### users

> **users**: [`UserManager`](UserManager.md)

***

### voice

> `readonly` **voice**: [`VoiceManager`](VoiceManager.md)

## Methods

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

#### Overrides

`EventEmitter.emit`

***

### login()

> **login**(`tokenOrOptions`): `Promise`\<`any`\>

Logs in and connects to the Stoat gateway.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `tokenOrOptions` | `string` \| [`LoginOptions`](../interfaces/LoginOptions.md) | A bot token, or `{ token, type: "user" }` for a user session. A [UserSession](../interfaces/UserSession.md) from [loginWithCredentials](#loginwithcredentials) can be passed directly. |

#### Returns

`Promise`\<`any`\>

#### Throws

For a user account that hasn't picked a username yet.

#### Example

```ts
// Bot
await client.login(process.env.BOT_TOKEN);
// User session saved from an earlier loginWithCredentials()
await client.login({ token: savedToken, type: "user" });
```

***

### loginWithCredentials()

> **loginWithCredentials**(`options`): `Promise`\<[`LoginResult`](../type-aliases/LoginResult.md)\>

Logs in to a user account with an email and password, then connects.
Save `result.session` to log in again later with `client.login(session)`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `options` | [`CredentialLoginOptions`](../type-aliases/CredentialLoginOptions.md) | The email and password, or the MFA ticket and response for the second step. |

#### Returns

`Promise`\<[`LoginResult`](../type-aliases/LoginResult.md)\>

`Success` once connected, `MFA` if a second factor is needed, `Onboarding` if the
account must pick a username first, or `Disabled`.

#### Example

```ts
let result = await client.loginWithCredentials({ email, password, friendlyName: "My App" });

if (result.result === "MFA") {
  const totpCode = await promptForCode();
  result = await client.loginWithCredentials({ mfaTicket: result.ticket, mfaResponse: { totpCode } });
}

if (result.result === "Onboarding") {
  await client.auth.completeOnboarding(await promptForUsername());
  await client.login(result.session);
}

if (result.result === "Success" || result.result === "Onboarding") {
  localStorage.setItem("session", JSON.stringify(result.session));
}
```

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

#### Overrides

`EventEmitter.on`

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

#### Overrides

`EventEmitter.once`
