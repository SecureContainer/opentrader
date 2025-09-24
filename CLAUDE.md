# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Prerequisites
- Node.js v24.7.0 (LTS recommended)
- pnpm 10.16.1+ (install with: `curl -fsSL https://get.pnpm.io/install.sh | sh -`)

### Core Commands
- **Install dependencies**: `pnpm install` (from project root)
- **Development server**: `pnpm dev` or `./bin/dev.sh`
- **Build application**: `pnpm build` (builds all packages and main app)
- **Build main app only**: `cd app && npx tsup`
- **Lint code**: `pnpm lint` (oxlint) or `pnpm lint:fix` (auto-fix)
- **Type checking**: `pnpm typecheck`
- **Run tests**: `pnpm test` (vitest across all projects)
- **Format code**: `pnpm format` (prettier)

### CLI Usage
- **Development**: `./bin/dev.sh [args]` (uses ts-node)
- **Production**: `./bin/cli.sh [args]` (uses built CLI from dist/)

## Architecture Overview

### Monorepo Structure
This is a **pnpm workspace monorepo** using **Moon** build tool for task orchestration. The project is organized into:

- `app/` - Main OpenTrader application (entry points and bundling)
- `packages/` - Core library packages (15 packages including backtesting, bot, db, exchanges, etc.)
- `pro/` - Professional/premium features

### Key Packages
- `@opentrader/bot-processor` - Core bot processing engine
- `@opentrader/exchanges` - Exchange integrations (uses ccxt)
- `@opentrader/db` - Database layer (Prisma + SQLite)
- `@opentrader/backtesting` - Strategy backtesting
- `@opentrader/trpc` - API layer (tRPC)
- `@opentrader/bot-templates` - Pre-built trading strategies

### Build System
- **Bundler**: tsup (esbuild-based) for main application
- **Output**: 4 standalone ESM bundles in `app/dist/`:
  - `main.mjs` - Core library exports
  - `cli.mjs` - Command line interface
  - `daemon.mjs` - Background daemon service
  - `standalone.mjs` - All-in-one bundle
- **Type Definitions**: Generated with dts-bundle-generator (includes ccxt types)

### Technology Stack
- **Language**: TypeScript 5.8.3
- **Runtime**: Node.js ESM modules
- **Database**: Prisma with SQLite (dev.db)
- **Exchange API**: ccxt 4.4.91
- **API Framework**: tRPC 11.4.1
- **Validation**: Zod 3.25.65
- **Logging**: Pino
- **Testing**: Vitest

### Development Workflow
1. The project uses **Moon** for coordinated builds across packages
2. Main development uses ts-node for fast iteration
3. Production builds create bundled ESM modules with all dependencies included
4. Each package can be built independently or as part of the workspace
5. The build system handles complex dependency resolution between internal packages

### Configuration Files
- `moon.yml` files define build tasks and dependencies
- `.oxlintrc.json` configures the fast oxlint linter
- `tsup.config.ts` handles main application bundling with custom plugins
- `vitest.config.ts` orchestrates testing across all packages

### Important Notes
- This is a **modified fork** of the original OpenTrader project with build system fixes
- Uses workspace protocol (`workspace:*`) for internal package dependencies
- All builds target ESNext with tree-shaking enabled
- The daemon service provides RPC interface for bot management