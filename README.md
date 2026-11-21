# Stoatx

A high-performance, fully-typed, and memory-efficient toolkit for building on the Stoat platform: bots, and clients for user accounts that run in Node.js or the browser.

The Stoatx ecosystem is designed with flexibility in mind. Whether you prefer a highly organized, decorator-based framework inspired by `discordx`, or a lean, object-oriented client wrapper inspired by `discord.js`, Stoatx provides the tools you need to scale.

For guides, API references, and examples, visit the **[Stoatx Documentation](https://stoatx-ts.github.io/stoatx/)**.

---

## 🏗️ Project Structure

This repository is a monorepo managed using modern Node tooling. It contains both the core libraries and example applications.

- **`apps/bot`** — A sample bot built using the `stoatx` command handler and `@stoatx/client`. This serves as mostly a testing ground for new features and a reference implementation for users.
- **`apps/docs`** — Documentation site for the Stoatx ecosystem.
- **`packages/client`** (`@stoatx/client`) — The core REST and WebSocket API wrapper.
- **`packages/stoatx`** (`stoatx`) — The decorator-based command framework.
- **`packages/voice`** (`@stoatx/voice`) — The shared voice connection and manager.
- **`packages/voice-node`** (`@stoatx/voice-node`) — Voice for Node.js: join calls and play audio.
- **`packages/voice-browser`** (`@stoatx/voice-browser`) — Voice for browsers: join calls with the microphone.

---

## 📦 Ecosystem Packages

Stoatx is split into separate packages, so you only install what you use.

### 1. The Command Handler (`stoatx`)

A powerful, decorator-based framework for organizing commands, guards, and events. If you want to build a large bot with cleanly separated concerns, this is the recommended approach.

### 2. The Core Client (`@stoatx/client`)

A robust object-oriented wrapper around the Stoat APIs. It powers the `stoatx` handler, but can be used entirely standalone if you prefer writing your own command logic. It also logs in to user accounts and runs in browsers, so you can build your own Stoat client with it.

### 3. Voice (`@stoatx/voice-node`, `@stoatx/voice-browser`)

Join voice calls with `@stoatx/client`. `@stoatx/voice-node` plays audio from Node.js, e.g. for music bots. `@stoatx/voice-browser` joins calls with the user's microphone and speakers in web apps. Both are built on `@stoatx/voice`, which installs automatically.

Head over to the [documentation](https://stoatx-ts.github.io/stoatx/) to get started with any of them.

---

## 🤝 Contributing

Contributions to the Stoatx ecosystem are highly encouraged! Whether you are fixing bugs in the client, adding new features to the handler, or improving the documentation:

1. Clone this repository.
2. Install [mise](https://mise.jdx.dev/), which is used to manage Node and pnpm versions for this project.
3. Run `mise install` to install the required tools.
4. Run `mise run install:frozen` at the root to install project dependencies.
5. Make your changes within the respective `packages/*` or `apps/*` directory.
6. Use the provided tasks to make sure your changes compile and pass the tests: `mise run build`, `mise run build:check` and `mise run test` (or run all CI checks with `mise run ci`, and fix formatting with `mise run format:fix`).
7. Submit a Pull Request.

### Available Tasks

You can run these tasks using `mise run <task>` (or `mise <task>` for short):

- `build`: Build all packages
- `build:bot`: Build the bot application
- `build:check`: Check types are compiling, including tests
- `build:client`: Build the `@stoatx/client` package
- `build:stoatx`: Build the `stoatx` package
- `ci`: Run the CI checks (build, type check, formatting and tests)
- `dev:docs`: Start the documentation site locally
- `docs:version`: Snapshot a new version of the API documentation
- `format`: Check if the codebase is formatted correctly (CI)
- `format:fix`: Format the codebase using Prettier
- `install:deps`: Install all dependencies (updates the lockfile if necessary)
- `install:frozen`: Install all dependencies (without updating the lockfile)
- `test`: Run the tests
- `test:coverage`: Run the tests with coverage
- `test:watch`: Run the tests in watch mode

You can also view all available tasks by running `mise tasks`.

---

## 📄 License

Because this is a monorepo containing multiple distinct tools, **packages in this repository are licensed individually.**

- Core Client (`@stoatx/client`): MIT License
- Command Handler (`stoatx`): MIT License
- Voice (`@stoatx/voice`, `@stoatx/voice-node`, `@stoatx/voice-browser`): MIT License

Please check the `LICENSE` file within each specific package directory for exact details.
