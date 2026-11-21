# Type Alias: VoiceConnectionFactory\<C\>

> **VoiceConnectionFactory**\<`C`\> = (`channelId`, `serverId`) => `C`

Creates a platform's connection for a channel.

## Type Parameters

| Type Parameter |
| ------ |
| `C` *extends* [`BaseVoiceConnection`](../classes/BaseVoiceConnection.md) |

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `channelId` | `string` | The voice channel's ID. |
| `serverId` | `string` \| `null` | The ID of the server the channel is in, or `null` for DMs and groups. |

## Returns

`C`
