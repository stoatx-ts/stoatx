---
title: Introduction
sidebar_label: Introduction
sidebar_position: 1
---

# Introduction

:::warning
This guide later talks about the framework `stoatx`, but you can follow along with just `@stoatx/client` if you prefer to build your own framework or use a different one.
The concepts and code examples may differ slightly, but the core principles remain the same.
:::

## What Is @stoatx/client

`@stoatx/client` is an object-oriented wrapper for the Stoat API. Instead of manually handling raw JSON payloads and WebSocket heartbeats,
this library transforms Stoat's data into predictable, strongly-typed JavaScript objects (like Server, Channel, and Message).

It handles the heavy lifting of rate limits, caching, and connection management so you can focus on building your bot's features.

## Prerequisites

Before getting started, make sure you have:

- **Node.js:** Version 22.0.0 or newer.
- **TypeScript:** Basic to intermediate knowledge of TypeScript, as this library is heavily typed.
- **A Stoat Account:** You will need a Stoat account to create a bot and obtain an API token.

## Core Architecture

To use the library effectively, it helps to understand its three main pillars:

- **The Client:** Your bot's central hub. It manages the REST API requests, the WebSocket connection to the gateway, and holds your global caches.

- **Managers:** Data controllers. Whenever you need to fetch, cache, or resolve data, you use a Manager. For example, client.users is the UserManager responsible for finding and storing users.

- **Structures:** The actual data objects. When a Manager fetches data, it returns a Structure (like a Message or a Member). These structures have built-in helper methods, allowing you to do things like message.delete() directly.

## Next Steps

Ready to write some code? Head over to the [Installation and Setup](./installation-and-setup.md) guide to get your project initialized and your bot online.
