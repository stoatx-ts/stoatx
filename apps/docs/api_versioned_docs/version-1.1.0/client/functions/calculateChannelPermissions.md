# Function: calculateChannelPermissions()

> **calculateChannelPermissions**(`client`, `channel`, `userId`): `bigint`

A user's permissions in a channel.

- **Saved Notes**: everything for its owner.
- **DMs**: friends (and bots) can message each other; otherwise, including when either has
  blocked the other, the DM is read-only.
- **Groups**: everything for the owner; members get the group's permissions, which can't take
  away viewing it.
- **Server channels**: the server's default permissions, the channel's default override, each
  role's override, then each role's channel override (lowest role first). A timed-out member
  keeps only [ALLOW\_IN\_TIMEOUT](../variables/ALLOW_IN_TIMEOUT.md), and without `ViewChannel` there are no permissions at all.

Users that aren't cached, or aren't in the channel, have no permissions.

## Parameters

| Parameter | Type |
| ------ | ------ |
| `client` | [`Client`](../classes/Client.md) |
| `channel` | [`BaseChannel`](../classes/BaseChannel.md) |
| `userId` | `string` |

## Returns

`bigint`
