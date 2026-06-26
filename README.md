# Stoatx

A high-performance, fully-typed, and memory-efficient toolkit for building bots on the Stoat platform.

The Stoatx ecosystem is designed with flexibility in mind. Whether you prefer a highly organized, decorator-based framework inspired by `discordx`, or a lean, object-oriented client wrapper inspired by `discord.js`, Stoatx provides the tools you need to scale.

For guides, API references, and examples, visit the **[Stoatx Documentation](https://stoatx-ts.github.io/stoatx/)**.

---

## 🏗️ Project Structure

This repository is a monorepo managed using modern Node tooling. It contains both the core libraries and example applications.

* **`apps/bot`** — A sample bot built using the `stoatx` command handler and `@stoatx/client`. This serves as mostly a testing ground for new features and a reference implementation for users.
* **`apps/docs`** — Documentation site for the Stoatx ecosystem.
* **`packages/client`** (`@stoatx/client`) — The core REST and WebSocket API wrapper.
* **`packages/handler`** (`stoatx`) — The decorator-based command framework.

---

## 📦 Ecosystem Packages

Stoatx is split into two primary packages to give developers control over their architecture.

### 1. The Command Handler (`stoatx`)

A powerful, decorator-based framework for organizing commands, guards, and events. If you want to build a large bot with cleanly separated concerns, this is the recommended approach.

### 2. The Core Client (`@stoatx/client`)

A robust object-oriented wrapper around the Stoat APIs. It powers the `stoatx` handler, but can be used entirely standalone if you prefer writing your own command logic.

Head over to the [documentation](https://stoatx-ts.github.io/stoatx/) to get started with either package.

---

## 🤝 Contributing

Contributions to the Stoatx ecosystem are highly encouraged! Whether you are fixing bugs in the client, adding new features to the handler, or improving the documentation:

1. Clone this repository.
2. Install [mise](https://mise.jdx.dev/), which is used to manage Node and pnpm versions for this project.
3. Run `mise install` to install the required tools.
4. Run `mise run install:frozen` at the root to install project dependencies.
5. Make your changes within the respective `packages/*` or `apps/*` directory.
6. Use the provided tasks to ensure your changes compile successfully: `mise run build` (you can also use `mise run format:fix` or `mise run build:check`).
7. Submit a Pull Request.

### Available Tasks

You can run these tasks using `mise run <task>` (or `mise <task>` for short):
- `build`: Build all packages
- `build:bot`: Build the bot application
- `build:check`: Check types are compiling
- `build:client`: Build `@stoatx/client` package
- `build:stoatx`: Build `stoatx` package
- `ci`: Task group for CI checks (runs install, build, typecheck, and formatting checks)
- `format`: Check if the codebase is formatted correctly (CI)
- `format:fix`: Format the codebase using Prettier
- `install:frozen`: Install all dependencies (without updating the lockfile)
- `install`: Install all dependencies (updates lockfile if necessary)

You can also view all available tasks by running `mise tasks`.

---

## 📄 License

Because this is a monorepo containing multiple distinct tools, **packages in this repository are licensed individually.**

* Core Client (`@stoatx/client`): MIT License
* Command Handler (`stoatx`): MIT License

Please check the `LICENSE` file within each specific package directory for exact details.