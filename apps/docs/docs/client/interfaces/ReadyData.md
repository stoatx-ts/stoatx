# Interface: ReadyData

The raw `Ready` payload: the initial state the gateway sends after connecting.
Fields marked "user sessions" are only sent to user accounts, not bots.

## Properties

### channel\_unreads?

> `optional` **channel\_unreads?**: `object`[]

User sessions: unread state for each channel.

***

### channels?

> `optional` **channels?**: (\{ \} \| \{ \} \| \{ \} \| \{ \})[]

***

### emojis?

> `optional` **emojis?**: `object`[]

***

### members?

> `optional` **members?**: `object`[]

***

### policy\_changes?

> `optional` **policy\_changes?**: [`PolicyChange`](PolicyChange.md)[]

User sessions: policy changes the user hasn't acknowledged yet. Loaded into `client.auth.policyChanges`.

***

### servers?

> `optional` **servers?**: `object`[]

***

### user\_settings?

> `optional` **user\_settings?**: `Record`\<`string`, \[`number`, `string`\]\>

User sessions: synced settings, keyed by name, as `[updatedAt, value]`. Loaded into `client.settings`.

***

### users?

> `optional` **users?**: `object`[]

***

### voice\_states?

> `optional` **voice\_states?**: [`RawChannelVoiceState`](RawChannelVoiceState.md)[]

Who's in which voice call. Loaded into `client.voiceStates`.
