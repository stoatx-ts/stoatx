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

## Methods

### delete()

> **delete**\<`P`\>(`endpoint`, `params?`): `Promise`\<`RouteResponse`\<`"delete"`, `P`\>\>

#### Type Parameters

| Type Parameter |
| ------ |
| `P` *extends* `` `/users/${string}/friend` `` \| `"-/users/{target}/friend"` \| `` `/users/${string}/block` `` \| `"-/users/{target}/block"` \| `` `/bots/${string}` `` \| `"-/bots/{bot_id}"` \| `` `/channels/${string}` `` \| `"-/channels/{target}"` \| `` `/channels/${string}/messages/${string}/pin` `` \| `"-/channels/{target}/messages/{msg}/pin"` \| `` `/channels/${string}/messages/${string}` `` \| `"-/channels/{target}/messages/{msg}"` \| `` `/channels/${string}/messages/bulk` `` \| `"-/channels/{target}/messages/bulk"` \| `` `/channels/${string}/recipients/${string}` `` \| `"-/channels/{group_id}/recipients/{member_id}"` \| `` `/channels/${string}/messages/${string}/reactions/${string}` `` \| `"-/channels/{target}/messages/{msg}/reactions/{emoji}"` \| `` `/channels/${string}/messages/${string}/reactions` `` \| `"-/channels/{target}/messages/{msg}/reactions"` \| `` `/servers/${string}` `` \| `"-/servers/{target}"` \| `` `/servers/${string}/members/${string}` `` \| `"-/servers/{server_id}/members/{member_id}"` \| `` `/servers/${string}/bans/${string}` `` \| `"-/servers/{server}/bans/{target}"` \| `` `/servers/${string}/roles/${string}` `` \| `"-/servers/{target}/roles/{role_id}"` \| `` `/invites/${string}` `` \| `"-/invites/{target}"` \| `` `/custom/emoji/${string}` `` \| `"-/custom/emoji/{emoji_id}"` \| `` `/auth/session/${string}` `` \| `"-/auth/session/{id}"` \| `"/auth/mfa/totp"` \| `` `/webhooks/${string}/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}/{message_id}"` \| `` `/webhooks/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}"` \| `` `/webhooks/${string}` `` \| `"-/webhooks/{webhook_id}"` |

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `endpoint` | `P` |
| `params?` | `RouteParams`\<`"delete"`, `P`\> |

#### Returns

`Promise`\<`RouteResponse`\<`"delete"`, `P`\>\>

***

### get()

> **get**\<`P`\>(`endpoint`, `params?`): `Promise`\<`RouteResponse`\<`"get"`, `P`\>\>

#### Type Parameters

| Type Parameter |
| ------ |
| `P` *extends* `"/"` \| `` `/users/${string}` `` \| `"-/users/{target}"` \| `` `/users/${string}/flags` `` \| `"-/users/{target}/flags"` \| `` `/users/${string}/default_avatar` `` \| `"-/users/{target}/default_avatar"` \| `` `/users/${string}/profile` `` \| `"-/users/{target}/profile"` \| `` `/users/${string}/dm` `` \| `"-/users/{target}/dm"` \| `` `/users/${string}/mutual` `` \| `"-/users/{target}/mutual"` \| `` `/bots/${string}/invite` `` \| `"-/bots/{target}/invite"` \| `` `/bots/${string}` `` \| `"-/bots/{bot_id}"` \| `` `/channels/${string}` `` \| `"-/channels/{target}"` \| `` `/channels/${string}/members` `` \| `"-/channels/{target}/members"` \| `` `/channels/${string}/messages` `` \| `"-/channels/{target}/messages"` \| `` `/channels/${string}/messages/${string}` `` \| `"-/channels/{target}/messages/{msg}"` \| `` `/channels/${string}/webhooks` `` \| `"-/channels/{channel_id}/webhooks"` \| `` `/servers/${string}` `` \| `"-/servers/{target}"` \| `` `/servers/${string}/members` `` \| `"-/servers/{target}/members"` \| `` `/servers/${string}/members/${string}` `` \| `"-/servers/{server_id}/members/{member_id}"` \| `` `/servers/${string}/members_experimental_query` `` \| `"-/servers/{target}/members_experimental_query"` \| `` `/servers/${string}/bans` `` \| `"-/servers/{target}/bans"` \| `` `/servers/${string}/invites` `` \| `"-/servers/{target}/invites"` \| `` `/servers/${string}/roles/${string}` `` \| `"-/servers/{target}/roles/{role_id}"` \| `` `/servers/${string}/emojis` `` \| `"-/servers/{target}/emojis"` \| `` `/servers/${string}/audit_logs` `` \| `"-/servers/{target}/audit_logs"` \| `` `/invites/${string}` `` \| `"-/invites/{target}"` \| `` `/custom/emoji/${string}` `` \| `"-/custom/emoji/{emoji_id}"` \| `"/auth/account/"` \| `"/auth/session/all"` \| `"/auth/mfa/"` \| `"/auth/mfa/methods"` \| `"/onboard/hello"` \| `"/sync/unreads"` \| `` `/webhooks/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}"` \| `` `/webhooks/${string}` `` \| `"-/webhooks/{webhook_id}"` |

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
| `P` *extends* `"/"` \| `` `/users/${string}` `` \| `"-/users/{target}"` \| `` `/users/${string}/flags` `` \| `"-/users/{target}/flags"` \| `` `/users/${string}/default_avatar` `` \| `"-/users/{target}/default_avatar"` \| `` `/users/${string}/profile` `` \| `"-/users/{target}/profile"` \| `` `/users/${string}/dm` `` \| `"-/users/{target}/dm"` \| `` `/users/${string}/mutual` `` \| `"-/users/{target}/mutual"` \| `` `/users/${string}/friend` `` \| `"-/users/{target}/friend"` \| `` `/users/${string}/block` `` \| `"-/users/{target}/block"` \| `` `/bots/${string}/invite` `` \| `"-/bots/{target}/invite"` \| `` `/bots/${string}` `` \| `"-/bots/{bot_id}"` \| `` `/channels/${string}/ack/${string}` `` \| `"-/channels/{target}/ack/{message}"` \| `` `/channels/${string}` `` \| `"-/channels/{target}"` \| `` `/channels/${string}/members` `` \| `"-/channels/{target}/members"` \| `` `/channels/${string}/invites` `` \| `"-/channels/{target}/invites"` \| `` `/channels/${string}/messages` `` \| `"-/channels/{target}/messages"` \| `` `/channels/${string}/search` `` \| `"-/channels/{target}/search"` \| `` `/channels/${string}/messages/${string}/pin` `` \| `"-/channels/{target}/messages/{msg}/pin"` \| `` `/channels/${string}/messages/${string}` `` \| `"-/channels/{target}/messages/{msg}"` \| `` `/channels/${string}/messages/bulk` `` \| `"-/channels/{target}/messages/bulk"` \| `` `/channels/${string}/recipients/${string}` `` \| `"-/channels/{group_id}/recipients/{member_id}"` \| `` `/channels/${string}/join_call` `` \| `"-/channels/{target}/join_call"` \| `` `/channels/${string}/end_ring/${string}` `` \| `"-/channels/{target}/end_ring/{target_user}"` \| `` `/channels/${string}/permissions/${string}` `` \| `"-/channels/{target}/permissions/{role_id}"` \| `` `/channels/${string}/permissions/default` `` \| `"-/channels/{target}/permissions/default"` \| `` `/channels/${string}/messages/${string}/reactions/${string}` `` \| `"-/channels/{target}/messages/{msg}/reactions/{emoji}"` \| `` `/channels/${string}/messages/${string}/reactions` `` \| `"-/channels/{target}/messages/{msg}/reactions"` \| `` `/channels/${string}/webhooks` `` \| `"-/channels/{channel_id}/webhooks"` \| `` `/servers/${string}` `` \| `"-/servers/{target}"` \| `` `/servers/${string}/ack` `` \| `"-/servers/{target}/ack"` \| `` `/servers/${string}/channels` `` \| `"-/servers/{server}/channels"` \| `` `/servers/${string}/members` `` \| `"-/servers/{target}/members"` \| `` `/servers/${string}/members/${string}` `` \| `"-/servers/{server_id}/members/{member_id}"` \| `` `/servers/${string}/members_experimental_query` `` \| `"-/servers/{target}/members_experimental_query"` \| `` `/servers/${string}/bans/${string}` `` \| `"-/servers/{server}/bans/{target}"` \| `` `/servers/${string}/bans` `` \| `"-/servers/{target}/bans"` \| `` `/servers/${string}/invites` `` \| `"-/servers/{target}/invites"` \| `` `/servers/${string}/roles` `` \| `"-/servers/{target}/roles"` \| `` `/servers/${string}/roles/${string}` `` \| `"-/servers/{target}/roles/{role_id}"` \| `` `/servers/${string}/permissions/${string}` `` \| `"-/servers/{target}/permissions/{role_id}"` \| `` `/servers/${string}/permissions/default` `` \| `"-/servers/{target}/permissions/default"` \| `` `/servers/${string}/emojis` `` \| `"-/servers/{target}/emojis"` \| `` `/servers/${string}/roles/ranks` `` \| `"-/servers/{target}/roles/ranks"` \| `` `/servers/${string}/audit_logs` `` \| `"-/servers/{target}/audit_logs"` \| `` `/invites/${string}` `` \| `"-/invites/{target}"` \| `` `/custom/emoji/${string}` `` \| `"-/custom/emoji/{emoji_id}"` \| `"/safety/report"` \| `"/auth/account/create"` \| `"/auth/account/reverify"` \| `"/auth/account/delete"` \| `"/auth/account/"` \| `"/auth/account/disable"` \| `"/auth/account/change/password"` \| `"/auth/account/change/email"` \| `` `/auth/account/verify/${string}` `` \| `"-/auth/account/verify/{code}"` \| `"/auth/account/reset_password"` \| `` `/auth/session/${string}` `` \| `"-/auth/session/{id}"` \| `"/auth/mfa/ticket"` \| `"/auth/mfa/"` \| `"/auth/mfa/recovery"` \| `"/auth/mfa/methods"` \| `"/auth/mfa/totp"` \| `"/onboard/hello"` \| `"/onboard/complete"` \| `"/policy/acknowledge"` \| `"/push/subscribe"` \| `"/push/unsubscribe"` \| `"/sync/settings/fetch"` \| `"/sync/settings/set"` \| `"/sync/unreads"` \| `` `/webhooks/${string}/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}/{message_id}"` \| `` `/webhooks/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}"` \| `` `/webhooks/${string}` `` \| `"-/webhooks/{webhook_id}"` \| `` `/webhooks/${string}/${string}/github` `` \| `"-/webhooks/{webhook_id}/{token}/github"` |

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
| `P` *extends* `` `/users/${string}` `` \| `"-/users/{target}"` \| `` `/bots/${string}` `` \| `"-/bots/{bot_id}"` \| `` `/channels/${string}` `` \| `"-/channels/{target}"` \| `` `/channels/${string}/messages/${string}` `` \| `"-/channels/{target}/messages/{msg}"` \| `` `/servers/${string}` `` \| `"-/servers/{target}"` \| `` `/servers/${string}/members/${string}` `` \| `"-/servers/{server_id}/members/{member_id}"` \| `` `/servers/${string}/roles/${string}` `` \| `"-/servers/{target}/roles/{role_id}"` \| `` `/servers/${string}/roles/ranks` `` \| `"-/servers/{target}/roles/ranks"` \| `` `/custom/emoji/${string}` `` \| `"-/custom/emoji/{emoji_id}"` \| `"/auth/account/change/password"` \| `"/auth/account/change/email"` \| `"/auth/account/reset_password"` \| `` `/auth/session/${string}` `` \| `"-/auth/session/{id}"` \| `"/auth/mfa/recovery"` \| `` `/webhooks/${string}/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}/{message_id}"` \| `` `/webhooks/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}"` \| `` `/webhooks/${string}` `` \| `"-/webhooks/{webhook_id}"` |

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
| `P` *extends* `"/users/friend"` \| `"/bots/create"` \| `` `/bots/${string}/invite` `` \| `"-/bots/{target}/invite"` \| `` `/channels/${string}/invites` `` \| `"-/channels/{target}/invites"` \| `` `/channels/${string}/messages` `` \| `"-/channels/{target}/messages"` \| `` `/channels/${string}/search` `` \| `"-/channels/{target}/search"` \| `` `/channels/${string}/messages/${string}/pin` `` \| `"-/channels/{target}/messages/{msg}/pin"` \| `"/channels/create"` \| `` `/channels/${string}/join_call` `` \| `"-/channels/{target}/join_call"` \| `` `/channels/${string}/webhooks` `` \| `"-/channels/{channel_id}/webhooks"` \| `"/servers/create"` \| `` `/servers/${string}/channels` `` \| `"-/servers/{server}/channels"` \| `` `/servers/${string}/roles` `` \| `"-/servers/{target}/roles"` \| `` `/invites/${string}` `` \| `"-/invites/{target}"` \| `"/safety/report"` \| `"/auth/account/create"` \| `"/auth/account/reverify"` \| `"/auth/account/delete"` \| `"/auth/account/disable"` \| `` `/auth/account/verify/${string}` `` \| `"-/auth/account/verify/{code}"` \| `"/auth/account/reset_password"` \| `"/auth/session/login"` \| `"/auth/session/logout"` \| `"/auth/mfa/recovery"` \| `"/auth/mfa/totp"` \| `"/onboard/complete"` \| `"/policy/acknowledge"` \| `"/push/subscribe"` \| `"/push/unsubscribe"` \| `"/sync/settings/fetch"` \| `"/sync/settings/set"` \| `` `/webhooks/${string}/${string}` `` \| `"-/webhooks/{webhook_id}/{token}"` \| `` `/webhooks/${string}/${string}/github` `` \| `"-/webhooks/{webhook_id}/{token}/github"` |

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
| `P` *extends* `` `/users/${string}/friend` `` \| `"-/users/{target}/friend"` \| `` `/users/${string}/block` `` \| `"-/users/{target}/block"` \| `` `/channels/${string}/ack/${string}` `` \| `"-/channels/{target}/ack/{message}"` \| `` `/channels/${string}/recipients/${string}` `` \| `"-/channels/{group_id}/recipients/{member_id}"` \| `` `/channels/${string}/end_ring/${string}` `` \| `"-/channels/{target}/end_ring/{target_user}"` \| `` `/channels/${string}/permissions/${string}` `` \| `"-/channels/{target}/permissions/{role_id}"` \| `` `/channels/${string}/permissions/default` `` \| `"-/channels/{target}/permissions/default"` \| `` `/channels/${string}/messages/${string}/reactions/${string}` `` \| `"-/channels/{target}/messages/{msg}/reactions/{emoji}"` \| `` `/servers/${string}/ack` `` \| `"-/servers/{target}/ack"` \| `` `/servers/${string}/bans/${string}` `` \| `"-/servers/{server}/bans/{target}"` \| `` `/servers/${string}/permissions/${string}` `` \| `"-/servers/{target}/permissions/{role_id}"` \| `` `/servers/${string}/permissions/default` `` \| `"-/servers/{target}/permissions/default"` \| `` `/custom/emoji/${string}` `` \| `"-/custom/emoji/{emoji_id}"` \| `"/auth/account/delete"` \| `"/auth/mfa/ticket"` \| `"/auth/mfa/totp"` |

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

> **setToken**(`token`): `void`

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `token` | `string` |

#### Returns

`void`

***

### uploadFile()

> **uploadFile**(`tag`, `fileBuffer`, `filename?`): `Promise`\<`string`\>

Uploads a file to Stoat's CDN and returns the File ID

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `tag` | [`CDNTag`](../type-aliases/CDNTag.md) |
| `fileBuffer` | `Buffer`\<`ArrayBufferLike`\> \| `Blob` |
| `filename?` | `string` |

#### Returns

`Promise`\<`string`\>
