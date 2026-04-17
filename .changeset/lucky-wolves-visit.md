---
"stoatx": minor
"@stoatx/bot": minor
---

- **stoatx**: Exported `DecoratorStore` to fix unused class IDE warnings, updated internal property typings on `StoatxHandler`, and restricted `StoatxHandler` to a type-only export to ensure users leverage the wrapper `Client` directly.
- **@stoatx/bot**: Wrapped the initialization flow in an async `main()` function to resolve Node.js warnings regarding unsettled top-level awaits.
