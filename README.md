This repository is a COPY of the Open Source project [OpenTrader](https://github.com/bludnic/opentrader) but with the following important changes

**Changes:**

- **✨ Build from Source **: Original [OpenTrader](https://github.com/bludnic/opentrader) does not build with the latest npm and pnpm versions. We fixed the compatibility to the [latest available packages](#runtime-environment)
- **📝 Clear Build Instructions provided ** [see below](#build-instructions)
- **⚙️ Bundling ** Each of the four distinct parts of the system is bundled into a Single Standalone ES Module WITHOUT EXTERNAL DEPENDENCIES [more about bundling](#bundle-configuration)

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
companyowner@test:~/opentrader/app$ node dist/standalone.mjs
🌟 OpenTrader Standalone Bundle - Starting up...
📦 Bundle Type: Standalone
⏰ Started at: 2025-09-24T16:06:31.373Z
🏗️ Standalone Bundle - Creating app instance...
(node:33430) [FSTDEP022] FastifyWarning: The router options for maxParamLength property access is deprecated. Please use "options.routerOptions" instead for accessing router options. The router options will be removed in `fastify@6`.
(Use `node --trace-warnings ...` to show where the warning was created)
✅ Standalone Bundle - App created successfully
[16:06:31.392] INFO: 🏛️  Loaded 0 exchange account(s)
[16:06:31.396] INFO: 🤖 Default bot: none
[16:06:31.402] INFO: ✅ Platform bootstrapped successfully
[16:06:31.438] INFO: RPC Server listening on port 4000
[16:06:31.438] INFO: OpenTrader UI: http://localhost:4000
^C🛑 Standalone Bundle - Shutting down...
✅ Standalone Bundle - Shutdown complete
[16:26:50.181] INFO: Shutting down Platform...
[16:26:50.183] INFO: Fastify Server has shut down gracefully.
[16:26:50.184] INFO: Platform has shut down gracefully. Press CTRL+C to exit.

```

## Key Notes

- This is a monorepo using pnpm workspaces
- The build creates 4 output files: `main.mjs`, `cli.mjs`, `standalone.mjs`, `daemon.mjs`
- You may see warnings about Node version mismatch (project wants ~22.12, but LTS versions work fine)
- The `pnpm install` at project root installs dependencies for all packages in the workspace
- The project uses TypeScript and builds to ESM format
- Build output is located in `app/dist/` directory

# Bundle Configuration

The app is bundled using **tsup** (a TypeScript bundler built on esbuild) configured in `app/tsup.config.ts:6-12`.
Internal libraries are included in each bundle, but EXTERNAL PACKAGES ARE NOT INCLUDED in this version.
See the [next version of this package for the full bundling option](https://github.com/SecureContainer/opentrader/tree/v2.0.0)

## The bundling method:

### 1. Entry Points
4 separate entry files define each bundle:
- `cli: "./src/cli.ts"` → `cli.mjs`
- `daemon: "./src/api/up/daemon.ts"` → `daemon.mjs`
- `main: "./src/main.ts"` → `main.mjs`
- `standalone: "./src/standalone.ts"` → `standalone.mjs`

### 2. Bundle Configuration
- **Format**: ESM only (`format: ["esm"]`)
- **Bundling**: Everything included (`bundle: true`, `skipNodeModulesBundle: false`)
- **Internal packages**: Workspace packages bundled in (`noExternal: [/@opentrader/]`)
- **Tree-shaking**: Enabled to remove unused code
- **Target**: `esnext` for modern JS features

### 3. ESM Compatibility
Custom esbuild banner (`app/tsup.config.ts:35-48`) injects Node.js compatibility shims:

```js
const require = createRequire(import.meta.url);
globalThis.__dirname = new URL('.', import.meta.url).pathname;
globalThis.__filename = new URL(import.meta.url).pathname;
```

### 4. Custom Plugins
Two custom plugins handle additional build tasks:
- `generatePackageJsonPlugin()` - Creates package.json for distribution
