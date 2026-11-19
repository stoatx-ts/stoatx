# Type Alias: GatewayClientMessage

> **GatewayClientMessage** = \{ `data`: `number`; `type`: `"Ping"`; \} \| \{ `channel`: `string`; `type`: `"BeginTyping"`; \} \| \{ `channel`: `string`; `type`: `"EndTyping"`; \} \| \{ `server_id`: `string`; `type`: `"Subscribe"`; \}

Messages the client can send to the gateway.

## Union Members

### Type Literal

\{ `data`: `number`; `type`: `"Ping"`; \}

***

### Type Literal

\{ `channel`: `string`; `type`: `"BeginTyping"`; \}

Shows the user as typing in a channel.

***

### Type Literal

\{ `channel`: `string`; `type`: `"EndTyping"`; \}

Stops showing the user as typing in a channel.

***

### Type Literal

\{ `server_id`: `string`; `type`: `"Subscribe"`; \}

Asks for presence and member updates from a server (user sessions only).
