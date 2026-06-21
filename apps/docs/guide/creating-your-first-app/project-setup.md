---
title: Project Setup
sidebar_label: Project Setup
sidebar_position: 1
---

# Project Setup

In the "Getting Started" section, we used the raw `@stoatx/client` to listen for events and send messages.
While that works for small scripts, stuffing dozens of commands into a single `messageCreate` event listener will quickly turn your codebase into an unmaintainable mess.

To build a scalable application, we are going to use the official `stoatx` framework.

## The Stoatx Framework

The framework is a powerful, decorator-based command handler built specifically for `@stoatx/client`. It allows you to:

- Isolate commands into their own independent files.
- Use TypeScript decorators (like `@SimpleCommand` and `@On`/`@Once`) to define logic cleanly.
- Automatically load and register everything on startup.

## Installation

Because the framework is designed to wrap the client seamlessly, `@stoatx/client` is listed as a peer dependency. This means you need to install both packages into your project to ensure they share the same single source of truth in memory.

If you are continuing from the previous section, you should remove the existing `@stoatx/client` installation first to avoid version conflicts,
and clean the lockfile to ensure a fresh installation:

```bash
pnpm remove @stoatx/client
pnpm clean --lockfile
```

Then, install the framework, it will automatically pull in the correct version of `@stoatx/client` as a peer dependency:

```bash
pnpm add stoatx
```

## Enabling Decorators

Because the framework relies heavily on decorators to map your commands and events, you must enable them in your TypeScript configuration.

Open your `tsconfig.json` and ensure `experimentalDecorators` and `emitDecoratorMetadata` are set to `true`:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## Folder Structure

A well-structured bot makes development much easier. Go ahead and create the following directories inside your `src` folder.
We will use these in the upcoming pages to organize our logic.

```
my-stoat-bot/
├── src/
│   ├── commands/     # All your @Command files will go here
│   ├── events/       # All your @Event listeners will go here
│   ├── env.ts        # Your Zod environment validation
│   └── index.ts      # The main entry point
├── .env
├── package.json
└── tsconfig.json
```
