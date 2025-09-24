This repository is a COPY of the Open Source project [OpenTrader](https://github.com/bludnic/opentrader) but with the following important changes

**Changes:**

- **✨ Build from Source **: Original [OpenTrader](https://github.com/bludnic/opentrader) does not build with the latest npm and pnpm versions. We fixed the compatibility to the [latest available packages](#runtime-environment)
- **📝 Clear Build Instructions provided ** [see below](#build-instructions)
- **⚙️ Bundling ** Each of the four distinct parts of the system is bundled into a Single Standalone ES Module. EXTERNAL DEPENDENCIES ARE ALSO BUNDLED INSIDE mjs BUNDLES [more about bundling](#bundle-configuration)
- **📦 Distribute Bundles to Clients**: [Streamlined distribution of compiled bundles to target clients with optimized delivery mechanisms](#distribution-instructions)

## Runtime Environment

### Node.js
- **Version**: v24.7.0
- **Release**: Current LTS/Latest stable

### Package Managers

#### npm
- **Version**: 11.5.1
- **Bundled with**: Node.js v24.7.0

#### pnpm
- **Version**: 10.16.1
- **Installation**: Standalone package manager


# Build Instructions

## Prerequisites
- Node.js (LTS version recommended)
- Moon CLI
   ```bash
  npm install -g @moonrepo/cli
  ```
- Initialize SQLite database
   ```bash
  cp .env.example .env
  cd packages/prisma
  ln -s ../../.env .
  nano .env
  # edit the location of the SQLite DB file
  DATABASE_URL="file:./dev.db"
  ```
  Run the commands to initialize the database schema
  ```bash
  moon run prisma:migrate
  ```
## Steps

1. **Install pnpm**:
   ```bash
   curl -fsSL https://get.pnpm.io/install.sh | sh -
   source ~/.bashrc
   ```

2. **Navigate to project root and install dependencies**:
   ```bash
   cd opentrader
   pnpm install
   ```

3. **Build the application**:
   ```bash
   cd app
   npx tsup
   ```

4. **Test the build** (optional):
   ```bash
   node dist/standalone.mjs
   ```
  Output should look as follows:
```
companyowner@test:~/opentrader1/app$ node dist/standalone.mjs
🌟 OpenTrader Standalone Bundle - Starting up...
📦 Bundle Type: Standalone
⏰ Started at: 2025-09-24T17:38:15.139Z
🏗️ Standalone Bundle - Creating app instance...
{"level":30,"time":1758735495203,"pid":35977,"hostname":"test-kms","msg":"🏛️  Loaded 0 exchange account(s)"}
{"level":30,"time":1758735495207,"pid":35977,"hostname":"test-kms","msg":"🤖 Default bot: none"}
{"level":30,"time":1758735495215,"pid":35977,"hostname":"test-kms","msg":"✅ Platform bootstrapped successfully"}
(node:35977) [FSTDEP022] FastifyWarning: The router options for maxParamLength property access is deprecated. Please use "options.routerOptions" instead for accessing router options. The router options will be removed in `fastify@6`.
(Use `node --trace-warnings ...` to show where the warning was created)
✅ Standalone Bundle - App created successfully
{"level":30,"time":1758735495251,"pid":35977,"hostname":"test-kms","msg":"RPC Server listening on port 4000"}
{"level":30,"time":1758735495251,"pid":35977,"hostname":"test-kms","msg":"OpenTrader UI: http://localhost:4000"}
^C🛑 Standalone Bundle - Shutting down...
{"level":30,"time":1758735509838,"pid":35977,"hostname":"test-kms","msg":"Shutting down Platform..."}
✅ Standalone Bundle - Shutdown complete
{"level":30,"time":1758735509840,"pid":35977,"hostname":"test-kms","msg":"Fastify Server has shut down gracefully."}
{"level":30,"time":1758735509841,"pid":35977,"hostname":"test-kms","msg":"Platform has shut down gracefully. Press CTRL+C to exit."}


```

## Key Notes

- This is a monorepo using pnpm workspaces
- The build creates 4 output files: `main.mjs`, `cli.mjs`, `standalone.mjs`, `daemon.mjs`
- You may see warnings about Node version mismatch (project wants ~22.12, but LTS versions work fine)
- The `pnpm install` at project root installs dependencies for all packages in the workspace
- The project uses TypeScript and builds to ESM format
- Build output is located in `app/dist/` directory

# Bundle Configuration

## Summary of Changes in the New Bundling Method

The key change is the explicit inclusion of external dependencies in the bundle. Here's what changed:

## [Old Bundling Method](https://github.com/SecureContainer/opentrader/tree/v1.0.0)

- Used `noExternal: [/@opentrader/]` - only bundled internal workspace packages
- External npm dependencies remained as peer dependencies

## New Bundling Method

- **Explicit Dependency Bundling**: Now explicitly lists all major external dependencies in `noExternal` array:
  - `@prisma/client`, `commander`, `express`, `ccxt`, `@trpc/server`, `@trpc/client`, `zod`, `superjson`, `pino`, `pino-pretty`, `json5`, `execa`, `random-words`
- **Commented Alternative**: Line 44 shows `//noExternal: [/.*/]` as an alternative to bundle ALL dependencies
- **Enhanced Prisma Support**: Added `PRISMA_QUERY_ENGINE_LIBRARY_TYPE = 'wasm'` in the banner to force Prisma to use bundled WASM instead of binary executables
- **Production Environment**: Sets `OPENTRADER_BUNDLED = "true"` flag and `NODE_ENV = "production"`
- **Binary Handling**: Added `.node` file copy loader for native modules

## Result

The new method creates truly standalone `.mjs` files that include both internal packages AND external npm dependencies, eliminating the need for `node_modules` entirely. The old method still required external dependencies to be installed separately.

This change transforms the bundles from "workspace-complete" to "fully-portable" executables.


# Distribution Instructions

## The following components need to be in the Client Distribution package (or Docker container):

1. mjs file (e.g. standalone.mjs)
2. database file (e.g. dev.db - this is configured in your .env file)
  ```
  # client will need to set up an environment variable to point to the database file
  export DATABASE_URL="file:/path/to/database/dev.db"
  ```
3. Prisma's Query Engine binary [see below](#additional-binaries-for-distribution)

# Additional Binaries For Distribution

## Details
This particular app needs a Prisma's Query Engine binary - a native compiled library that acts as the database interface layer.

###  What it is:

  - A platform-specific native binary (.so.node = shared object for Node.js)
  - The actual database query executor that translates Prisma Client calls into SQL
  - Compiled specifically for the destination OS type

###  Why it's needed:

  1. Performance: Native code is much faster than JavaScript for database operations
  2. Database Protocol: Handles low-level database connection protocols and SQL generation
  3. Type Safety: Validates queries against your Prisma schema at runtime
  4. Platform Independence: Prisma Client (JS) communicates with this engine via IPC

###  The bundling problem:

  - standalone.mjs bundle contains the JavaScript Prisma Client code
  - But it's missing the native binary that actually executes queries
  - Bundlers like tsup/esbuild can't bundle native .so.node files - they must be copied alongside the bundle
  - Prisma expects to find this binary in specific relative paths from where the bundle runs

###  Distribution location

  - on the source system the library is located in the folder where ```opentrader``` app was built:
  ```commandline
  opentrader/node_modules/.pnpm/@prisma+client@{prisma_version}_prisma@{prisma_version}_typescript@{typescript_version}__typescript@{typescript_version}/node_modules/@prisma/client/libquer
  y_engine-linux-{openssl_version}.so.node
  (for instance)
  opentrader/node_modules/.pnpm/@prisma+client@6.9.0_prisma@6.9.0_typescript@5.8.3__typescript@5.8.3/node_modules/@prisma/client/libquery_engine-debian-openssl-3.0.x.so.node
  ```
  - on the destination system the binary should be placed under
  ```
  /tmp/prisma-engines/
  ```





