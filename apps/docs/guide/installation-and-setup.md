---
title: Installation and Setup
sidebar_label: Installation and Setup
sidebar_position: 2
---

# Installation and Setup

In this guide, we will set up a brand-new TypeScript project, install `@stoatx/client`, and get a simple "Hello World" bot online.

:::danger
This guide assumes you have a basic understanding of Node.js and TypeScript.
If you're new to these technologies, we recommend checking out some introductory resources before proceeding.
:::

:::warning
You can skip having TypeScript experience, but we highly recommend it.
The client is built with advanced TypeScript features, and using it without understanding them will lead to a frustrating experience.

The guides are written with TypeScript in mind, so if you choose to use JavaScript, you may need to adapt the code examples and won't get the full benefits of type safety.
:::

### 1. Initialize the Project

First, create a new directory for your bot and initialize a new Node.js project. We highly recommend using `pnpm`, but `npm` or `yarn` will work just fine.

```bash
mkdir my-stoat-bot
cd my-stoat-bot
pnpm init -y
```

**Crucial Step:** Open the newly created package.json file and add "type": "module" to tell Node.js we are using modern ES Modules instead of CommonJS.

```json
{
  "name": "my-stoat-bot",
  "version": "1.0.0",
  "type": "module"
}
```

### 2. Install Dependencies

You will need the core `@stoatx/client` library, `dotenv` for loading secrets, and `zod` to safely validate them.

```bash
# Install the core library and runtime dependencies
pnpm add @stoatx/client dotenv zod

# Install TypeScript dependencies
pnpm add -D typescript @types/node tsx
```

### 3. Configure TypeScript

Since @stoatx/client leverages advanced generic types, you need a properly configured tsconfig.json. Create this file in the root of your project:

```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "outDir": "./dist"
  },
  "include": ["src/**/*"]
}
```

### 4. Securing Your Bot Token

:::danger
**Never hardcode your bot token directly into your code.**
:::

If you accidentally upload it to GitHub, anyone can take control of your bot.

Create a file named .env in the root of your project to safely store your credentials:

```
# .env
STOAT_TOKEN=your_bot_token_here
```

:::warning
Make sure to immediately create a .gitignore file and add .env to it so you don't accidentally commit your token to version control!
:::

To ensure your bot actually has a valid token before trying to boot up, we will use zod. Create a src folder, and inside it, create an env.ts file:

```typescript
// src/env.ts
import { config } from "dotenv";
import { z } from "zod";

// Load the environment variables from the .env file
config();

// Define the schema for our environment variables
const envSchema = z.object({
  STOAT_TOKEN: z.string().min(1, "A valid Stoat token is required."),
});

// Parse and export the validated environment object
export const env = envSchema.parse(process.env);
```

If your token is missing or malformed, zod will instantly crash the app with a helpful error, rather than letting the bot fail silently deep inside the connection logic.

### 5. Your First Bot Script

Create a `src` folder, and inside it, create an `index.ts` file. This will be the main entry point for your bot.

```typescript
// src/index.ts
import { Client } from "@stoatx/client";
import { env } from "./env.js"; // Note the .js extension for ES Modules

// Load the environment variables from the .env file
config();

// Initialize the client
const client = new Client({
  // You can specify cache limits and sweepers here later
});

// Listen for the "ready" event
client.once("ready", async () => {
  if (client.user) {
    console.log(`✅ Logged in successfully as ${client.user.username}!`);
  }
});

// Listen for incoming messages
client.on("messageCreate", async (message) => {
  // Ignore messages from other bots
  if (message.author.bot) return;

  // Respond to a simple ping command
  if (message.content === "!ping") {
    await message.channel.send("Pong! 🏓");
  }
});

// Connect to the Stoat Gateway
client.login(env.STOAT_TOKEN);
```

### 6. Booting Up

With everything in place, it's time to bring your bot online. Run the following command in your terminal:

```bash
pnpm tsx src/index.ts
```

If everything is configured correctly, you should see your success message in the console.
Go to a channel your bot has access to and type `!ping` it should immediately reply!

### Next Steps

Now that your bot is alive and responding, it's time to learn how to properly interact with the API.
Head over to the [Events and Managers](./events-and-managers.md) guide to understand how data flows through the client.
