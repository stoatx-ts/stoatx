# @stoatx/client

A high-performance, fully-typed, and memory-efficient client library for the Stoat API. Built from the ground up for the Stoatx ecosystem.

[![npm version](https://img.shields.io/npm/v/@stoatx/client.svg?style=flat-square)](https://www.npmjs.com/package/@stoatx/client)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue.svg?style=flat-square)](https://www.typescriptlang.org/)

## Features

- **Strictly Typed:** 100% TypeScript with highly accurate generic types for events and structures.
- **Smart Caching:** Built on a unified `BaseManager` architecture that guarantees reference stability (no duplicate objects in memory).
- **Automatic Memory Management:** Includes a built-in `SweeperManager` to prevent memory leaks in long-running applications.
- **Extensible:** Designed to seamlessly integrate with higher-level command frameworks like the Stoatx Handler.
- **Self-hosting support:** Natively supports custom Stoat instances via root API discovery.
- **Modern Node:** Pure ESM and CommonJS support built with `tsup`.

For installation instructions, guides, and API references, visit the **[Stoatx Documentation](https://stoatx-ts.github.io/stoatx/)**.

## License

MIT © [Stoatx / Stoatx Team]