# Class: RESTManager

## Constructors

### Constructor

> **new RESTManager**(`client`): `RESTManager`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](Client.md) |

#### Returns

`RESTManager`

## Accessors

### tokenType

#### Get Signature

> **get** **tokenType**(): [`TokenType`](../type-aliases/TokenType.md)

Whether the current token is a bot token or a user session token.

##### Returns

[`TokenType`](../type-aliases/TokenType.md)

## Methods

### clearToken()

> **clearToken**(): `void`

Forgets the current token, e.g. after logging out. Requests that need a token will fail until a new one is set.

#### Returns

`void`

***

### delete()

> **delete**\<`P`\>(`endpoint`, `params?`): `Promise`\<`RouteResponse`\<`"delete"`, `P`\>\>

#### Type Parameters

| Type Parameter |
| ------ |
| `P` *extends* `` `/users/${string}/friend` `` \| `"-/users/{target}/friend"` \| `` `/users/${string}/block` `` \| `"-/users/{target}/block"` \| `` `/bots/${string}/discover` `` \| `"-/bots/{bot_id}/discover"` \| `` `/channels/${string}/recipients/${string}` `` \| `"-/channels/{group_id}/recipients/{member_id}"` \| `` `/channels/${string}/messages/${string}/reactions/${string}` `` \| `"-/channels/{target}/messages/{msg}/reactions/{emoji}"` \| `` `/servers/${string}/bans/${string}` `` \| `"-/servers/{server}/bans/{target}"` \| `` `/servers/${string}/discover` `` \| `"-/servers/{server}/discover"` \| `` `/custom/emoji/${string}` `` \| `"-/custom/emoji/{emoji_id}"` \| `"/auth/mfa/totp"` \| `` `/bots/${string}` `` \| `"-/bots/{bot_id}"` \| `` `/channels/${string}` `` \| `"-/channels/{target}"` \| `` `/channels/${string}/messages/${string}/pin` `` \| `"-/channels/{target}/messages/{msg}/pin"` \| `` `/channels/${string}/messages/${string}` `` \| `"-/channels/{target}/messages/{msg}"` \| `` `/channels/${string}/messages/bulk` `` \| `"-/channels/{target}/messages/bulk"` \| `` `/channels/${string}/messages/${string}/reactions` `` \| `"-/channels/{target}/messages/{msg}/reactions"` \| `` `/servers/${string}` `` \| `"-/servers/{target}"` \| `` `/servers/${string}/members/${string}` `` \| `"-/servers/{server_id}/members/{member_id}"` \| `` `/servers/${string}/roles/${string}` `` \| `"-/servers/{target}/roles/{role_id}"` \| `` `/invites/${string}` `` \| `"-/invites/{target}"` \| `` `/auth/session/${string}` `` \| `"-/auth/session/{id}"` \| `` `/webhooks/${string}/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}/{message_id}"` \| `` `/webhooks/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}"` \| `` `/webhooks/${string}` `` \| `"-/webhooks/{webhook_id}"` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `endpoint` | `P` |
| `params?` | `RouteParams`\<`"delete"`, `P`\> |

#### Returns

`Promise`\<`RouteResponse`\<`"delete"`, `P`\>\>

***

### destroy()

> **destroy**(): `void`

Stops the internal bucket sweeper.

#### Returns

`void`

***

### get()

> **get**\<`P`\>(`endpoint`, `params?`): `Promise`\<`RouteResponse`\<`"get"`, `P`\>\>

#### Type Parameters

| Type Parameter |
| ------ |
| `P` *extends* `` `/bots/${string}/discover` `` \| `"-/bots/{bot_id}/discover"` \| `` `/servers/${string}/discover` `` \| `"-/servers/{server}/discover"` \| `` `/custom/emoji/${string}` `` \| `"-/custom/emoji/{emoji_id}"` \| `` `/bots/${string}` `` \| `"-/bots/{bot_id}"` \| `` `/channels/${string}` `` \| `"-/channels/{target}"` \| `` `/channels/${string}/messages/${string}` `` \| `"-/channels/{target}/messages/{msg}"` \| `` `/servers/${string}` `` \| `"-/servers/{target}"` \| `` `/servers/${string}/members/${string}` `` \| `"-/servers/{server_id}/members/{member_id}"` \| `` `/servers/${string}/roles/${string}` `` \| `"-/servers/{target}/roles/{role_id}"` \| `` `/invites/${string}` `` \| `"-/invites/{target}"` \| `"/auth/session/all"` \| `` `/webhooks/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}"` \| `` `/webhooks/${string}` `` \| `"-/webhooks/{webhook_id}"` \| `"/"` \| `` `/users/${string}` `` \| `"-/users/{target}"` \| `` `/users/${string}/flags` `` \| `"-/users/{target}/flags"` \| `` `/users/${string}/default_avatar` `` \| `"-/users/{target}/default_avatar"` \| `` `/users/${string}/profile` `` \| `"-/users/{target}/profile"` \| `` `/users/${string}/dm` `` \| `"-/users/{target}/dm"` \| `` `/users/${string}/mutual` `` \| `"-/users/{target}/mutual"` \| `` `/bots/${string}/invite` `` \| `"-/bots/{target}/invite"` \| `` `/channels/${string}/members` `` \| `"-/channels/{target}/members"` \| `` `/channels/${string}/messages` `` \| `"-/channels/{target}/messages"` \| `` `/channels/${string}/webhooks` `` \| `"-/channels/{channel_id}/webhooks"` \| `` `/servers/${string}/members` `` \| `"-/servers/{target}/members"` \| `` `/servers/${string}/members_experimental_query` `` \| `"-/servers/{target}/members_experimental_query"` \| `` `/servers/${string}/bans` `` \| `"-/servers/{target}/bans"` \| `` `/servers/${string}/invites` `` \| `"-/servers/{target}/invites"` \| `` `/servers/${string}/emojis` `` \| `"-/servers/{target}/emojis"` \| `` `/servers/${string}/audit_logs` `` \| `"-/servers/{target}/audit_logs"` \| `"/auth/account/"` \| `"/auth/mfa/"` \| `"/auth/mfa/methods"` \| `"/onboard/hello"` \| `"/sync/unreads"` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `endpoint` | `P` |
| `params?` | `RouteParams`\<`"get"`, `P`\> |

#### Returns

`Promise`\<`RouteResponse`\<`"get"`, `P`\>\>

***

### makeRequest()

> **makeRequest**\<`M`, `P`\>(`method`, `endpoint`, `params?`): `Promise`\<`RouteResponse`\<`M`, `P`\>\>

#### Type Parameters

| Type Parameter |
| ------ |
| `M` *extends* `"get"` \| `"patch"` \| `"put"` \| `"delete"` \| `"post"` |
| `P` *extends* `` `/users/${string}/friend` `` \| `"-/users/{target}/friend"` \| `` `/users/${string}/block` `` \| `"-/users/{target}/block"` \| `` `/bots/${string}/discover` `` \| `"-/bots/{bot_id}/discover"` \| `` `/channels/${string}/ack/${string}` `` \| `"-/channels/{target}/ack/{message}"` \| `` `/channels/${string}/recipients/${string}` `` \| `"-/channels/{group_id}/recipients/{member_id}"` \| `` `/channels/${string}/end_ring/${string}` `` \| `"-/channels/{target}/end_ring/{target_user}"` \| `` `/channels/${string}/permissions/${string}` `` \| `"-/channels/{target}/permissions/{role_id}"` \| `` `/channels/${string}/permissions/default` `` \| `"-/channels/{target}/permissions/default"` \| `` `/channels/${string}/messages/${string}/reactions/${string}` `` \| `"-/channels/{target}/messages/{msg}/reactions/{emoji}"` \| `` `/servers/${string}/ack` `` \| `"-/servers/{target}/ack"` \| `` `/servers/${string}/bans/${string}` `` \| `"-/servers/{server}/bans/{target}"` \| `` `/servers/${string}/permissions/${string}` `` \| `"-/servers/{target}/permissions/{role_id}"` \| `` `/servers/${string}/permissions/default` `` \| `"-/servers/{target}/permissions/default"` \| `` `/servers/${string}/discover` `` \| `"-/servers/{server}/discover"` \| `` `/custom/emoji/${string}` `` \| `"-/custom/emoji/{emoji_id}"` \| `"/auth/account/delete"` \| `"/auth/mfa/ticket"` \| `"/auth/mfa/totp"` \| `` `/bots/${string}` `` \| `"-/bots/{bot_id}"` \| `` `/channels/${string}` `` \| `"-/channels/{target}"` \| `` `/channels/${string}/messages/${string}/pin` `` \| `"-/channels/{target}/messages/{msg}/pin"` \| `` `/channels/${string}/messages/${string}` `` \| `"-/channels/{target}/messages/{msg}"` \| `` `/channels/${string}/messages/bulk` `` \| `"-/channels/{target}/messages/bulk"` \| `` `/channels/${string}/messages/${string}/reactions` `` \| `"-/channels/{target}/messages/{msg}/reactions"` \| `` `/servers/${string}` `` \| `"-/servers/{target}"` \| `` `/servers/${string}/members/${string}` `` \| `"-/servers/{server_id}/members/{member_id}"` \| `` `/servers/${string}/roles/${string}` `` \| `"-/servers/{target}/roles/{role_id}"` \| `` `/invites/${string}` `` \| `"-/invites/{target}"` \| `` `/auth/session/${string}` `` \| `"-/auth/session/{id}"` \| `` `/webhooks/${string}/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}/{message_id}"` \| `` `/webhooks/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}"` \| `` `/webhooks/${string}` `` \| `"-/webhooks/{webhook_id}"` \| `"/"` \| `` `/users/${string}` `` \| `"-/users/{target}"` \| `` `/users/${string}/flags` `` \| `"-/users/{target}/flags"` \| `` `/users/${string}/default_avatar` `` \| `"-/users/{target}/default_avatar"` \| `` `/users/${string}/profile` `` \| `"-/users/{target}/profile"` \| `` `/users/${string}/dm` `` \| `"-/users/{target}/dm"` \| `` `/users/${string}/mutual` `` \| `"-/users/{target}/mutual"` \| `` `/bots/${string}/invite` `` \| `"-/bots/{target}/invite"` \| `` `/channels/${string}/members` `` \| `"-/channels/{target}/members"` \| `` `/channels/${string}/invites` `` \| `"-/channels/{target}/invites"` \| `` `/channels/${string}/messages` `` \| `"-/channels/{target}/messages"` \| `` `/channels/${string}/search` `` \| `"-/channels/{target}/search"` \| `` `/channels/${string}/join_call` `` \| `"-/channels/{target}/join_call"` \| `` `/channels/${string}/webhooks` `` \| `"-/channels/{channel_id}/webhooks"` \| `` `/servers/${string}/channels` `` \| `"-/servers/{server}/channels"` \| `` `/servers/${string}/members` `` \| `"-/servers/{target}/members"` \| `` `/servers/${string}/members_experimental_query` `` \| `"-/servers/{target}/members_experimental_query"` \| `` `/servers/${string}/bans` `` \| `"-/servers/{target}/bans"` \| `` `/servers/${string}/invites` `` \| `"-/servers/{target}/invites"` \| `` `/servers/${string}/roles` `` \| `"-/servers/{target}/roles"` \| `` `/servers/${string}/emojis` `` \| `"-/servers/{target}/emojis"` \| `` `/servers/${string}/roles/ranks` `` \| `"-/servers/{target}/roles/ranks"` \| `` `/servers/${string}/audit_logs` `` \| `"-/servers/{target}/audit_logs"` \| `"/safety/report"` \| `"/auth/account/create"` \| `"/auth/account/reverify"` \| `"/auth/account/"` \| `"/auth/account/disable"` \| `"/auth/account/change/password"` \| `"/auth/account/change/email"` \| `` `/auth/account/verify/${string}` `` \| `"-/auth/account/verify/{code}"` \| `"/auth/account/reset_password"` \| `"/auth/mfa/"` \| `"/auth/mfa/recovery"` \| `"/auth/mfa/methods"` \| `"/onboard/hello"` \| `"/onboard/complete"` \| `"/policy/acknowledge"` \| `"/push/subscribe"` \| `"/push/unsubscribe"` \| `"/sync/settings/fetch"` \| `"/sync/settings/set"` \| `"/sync/unreads"` \| `` `/webhooks/${string}/${string}/github` `` \| `"-/webhooks/{webhook_id}/{token}/github"` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `method` | `M` |
| `endpoint` | `P` |
| `params?` | `RouteParams`\<`M`, `P`\> |

#### Returns

`Promise`\<`RouteResponse`\<`M`, `P`\>\>

***

### patch()

> **patch**\<`P`\>(`endpoint`, `params?`): `Promise`\<`RouteResponse`\<`"patch"`, `P`\>\>

#### Type Parameters

| Type Parameter |
| ------ |
| `P` *extends* `` `/custom/emoji/${string}` `` \| `"-/custom/emoji/{emoji_id}"` \| `` `/bots/${string}` `` \| `"-/bots/{bot_id}"` \| `` `/channels/${string}` `` \| `"-/channels/{target}"` \| `` `/channels/${string}/messages/${string}` `` \| `"-/channels/{target}/messages/{msg}"` \| `` `/servers/${string}` `` \| `"-/servers/{target}"` \| `` `/servers/${string}/members/${string}` `` \| `"-/servers/{server_id}/members/{member_id}"` \| `` `/servers/${string}/roles/${string}` `` \| `"-/servers/{target}/roles/{role_id}"` \| `` `/auth/session/${string}` `` \| `"-/auth/session/{id}"` \| `` `/webhooks/${string}/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}/{message_id}"` \| `` `/webhooks/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}"` \| `` `/webhooks/${string}` `` \| `"-/webhooks/{webhook_id}"` \| `` `/users/${string}` `` \| `"-/users/{target}"` \| `` `/servers/${string}/roles/ranks` `` \| `"-/servers/{target}/roles/ranks"` \| `"/auth/account/change/password"` \| `"/auth/account/change/email"` \| `"/auth/account/reset_password"` \| `"/auth/mfa/recovery"` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `endpoint` | `P` |
| `params?` | `RouteParams`\<`"patch"`, `P`\> |

#### Returns

`Promise`\<`RouteResponse`\<`"patch"`, `P`\>\>

***

### post()

> **post**\<`P`\>(`endpoint`, `params?`): `Promise`\<`RouteResponse`\<`"post"`, `P`\>\>

#### Type Parameters

| Type Parameter |
| ------ |
| `P` *extends* `"/auth/account/delete"` \| `"/auth/mfa/totp"` \| `` `/channels/${string}/messages/${string}/pin` `` \| `"-/channels/{target}/messages/{msg}/pin"` \| `` `/invites/${string}` `` \| `"-/invites/{target}"` \| `` `/webhooks/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}"` \| `"/users/friend"` \| `"/bots/create"` \| `` `/bots/${string}/invite` `` \| `"-/bots/{target}/invite"` \| `` `/channels/${string}/invites` `` \| `"-/channels/{target}/invites"` \| `` `/channels/${string}/messages` `` \| `"-/channels/{target}/messages"` \| `` `/channels/${string}/search` `` \| `"-/channels/{target}/search"` \| `"/channels/create"` \| `` `/channels/${string}/join_call` `` \| `"-/channels/{target}/join_call"` \| `` `/channels/${string}/webhooks` `` \| `"-/channels/{channel_id}/webhooks"` \| `"/servers/create"` \| `` `/servers/${string}/channels` `` \| `"-/servers/{server}/channels"` \| `` `/servers/${string}/roles` `` \| `"-/servers/{target}/roles"` \| `"/safety/report"` \| `"/auth/account/create"` \| `"/auth/account/reverify"` \| `"/auth/account/disable"` \| `` `/auth/account/verify/${string}` `` \| `"-/auth/account/verify/{code}"` \| `"/auth/account/reset_password"` \| `"/auth/session/login"` \| `"/auth/session/logout"` \| `"/auth/mfa/recovery"` \| `"/onboard/complete"` \| `"/policy/acknowledge"` \| `"/push/subscribe"` \| `"/push/unsubscribe"` \| `"/sync/settings/fetch"` \| `"/sync/settings/set"` \| `` `/webhooks/${string}/${string}/github` `` \| `"-/webhooks/{webhook_id}/{token}/github"` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `endpoint` | `P` |
| `params?` | `RouteParams`\<`"post"`, `P`\> |

#### Returns

`Promise`\<`RouteResponse`\<`"post"`, `P`\>\>

***

### put()

> **put**\<`P`\>(`endpoint`, `params?`): `Promise`\<`RouteResponse`\<`"put"`, `P`\>\>

#### Type Parameters

| Type Parameter |
| ------ |
| `P` *extends* `` `/users/${string}/friend` `` \| `"-/users/{target}/friend"` \| `` `/users/${string}/block` `` \| `"-/users/{target}/block"` \| `` `/bots/${string}/discover` `` \| `"-/bots/{bot_id}/discover"` \| `` `/channels/${string}/ack/${string}` `` \| `"-/channels/{target}/ack/{message}"` \| `` `/channels/${string}/recipients/${string}` `` \| `"-/channels/{group_id}/recipients/{member_id}"` \| `` `/channels/${string}/end_ring/${string}` `` \| `"-/channels/{target}/end_ring/{target_user}"` \| `` `/channels/${string}/permissions/${string}` `` \| `"-/channels/{target}/permissions/{role_id}"` \| `` `/channels/${string}/permissions/default` `` \| `"-/channels/{target}/permissions/default"` \| `` `/channels/${string}/messages/${string}/reactions/${string}` `` \| `"-/channels/{target}/messages/{msg}/reactions/{emoji}"` \| `` `/servers/${string}/ack` `` \| `"-/servers/{target}/ack"` \| `` `/servers/${string}/bans/${string}` `` \| `"-/servers/{server}/bans/{target}"` \| `` `/servers/${string}/permissions/${string}` `` \| `"-/servers/{target}/permissions/{role_id}"` \| `` `/servers/${string}/permissions/default` `` \| `"-/servers/{target}/permissions/default"` \| `` `/servers/${string}/discover` `` \| `"-/servers/{server}/discover"` \| `` `/custom/emoji/${string}` `` \| `"-/custom/emoji/{emoji_id}"` \| `"/auth/account/delete"` \| `"/auth/mfa/ticket"` \| `"/auth/mfa/totp"` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `endpoint` | `P` |
| `params?` | `RouteParams`\<`"put"`, `P`\> |

#### Returns

`Promise`\<`RouteResponse`\<`"put"`, `P`\>\>

***

### setBaseURL()

> **setBaseURL**(`baseURL`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `baseURL` | `string` |

#### Returns

`void`

***

### setCDNURL()

> **setCDNURL**(`cdnURL`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `cdnURL` | `string` |

#### Returns

`void`

***

### setToken()

> **setToken**(`token`, `type?`): `void`

Sets the token sent with every request.

#### Parameters

| Parameter | Type | Default value | Description |
| ------ | ------ | ------ | ------ |
| `token` | `string` | `undefined` | The bot token or user session token. |
| `type` | [`TokenType`](../type-aliases/TokenType.md) | `"bot"` | Whether `token` is a bot token or a user session token. Defaults to `"bot"`. |

#### Returns

`void`

***

### uploadFile()

> **uploadFile**(`tag`, `file`, `filename?`): `Promise`\<`string`\>

Uploads a file to Stoat's CDN and returns the File ID

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `tag` | [`CDNTag`](../type-aliases/CDNTag.md) | The CDN bucket to upload to, e.g. `"attachments"` or `"avatars"`. |
| `file` | [`AttachmentData`](../type-aliases/AttachmentData.md) | The file contents. A Node.js `Buffer` or a browser `File` both work. |
| `filename?` | `string` | The name the CDN stores the file under. |

#### Returns

`Promise`\<`string`\>

The ID of the uploaded file.
