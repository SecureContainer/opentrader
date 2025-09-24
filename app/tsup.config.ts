import { defineConfig } from "tsup";

import { copyPrismaSchemaPlugin } from "./plugins/copy-prisma-schema-plugin.js";
import { generatePackageJsonPlugin } from "./plugins/generate-package-json-plugin.js";

export default defineConfig({
  entry: {
    cli: "./src/cli.ts",
    daemon: "./src/api/up/daemon.ts",
    main: "./src/main.ts",
    standalone: "./src/standalone.ts",
  }, // Adjust this to your entry file
  format: ["esm"],
  outDir: "dist",
  dts: false, // Generate TypeScript declaration files if needed
  splitting: false,
  sourcemap: false,
  clean: true,
  minify: false,
  skipNodeModulesBundle: false,
  bundle: true,
  target: "esnext",
  treeshake: true,
  external: [], // No external dependencies - bundle everything
  env: {
    NODE_ENV: "production",
    OPENTRADER_BUNDLED: "true", // Flag to indicate this is a bundled build
  },
  noExternal: [
      /@opentrader/, 
      "@prisma/client",
     "commander",
      "express",
      "ccxt",
      "@trpc/server",
      "@trpc/client",
      "zod",
      "superjson",
      "pino",
      "pino-pretty",
      "json5",
      "execa",
      "random-words"],
  //noExternal: [/.*/], // Bundle ALL dependencies (both internal @opentrader packages and external npm packages)
  platform: "node",
  keepNames: true, // Preserve function names for better debugging
  outExtension: ({ format }) => {
    if (format === "esm") return { js: ".mjs" };
    if (format === "cjs") return { js: ".cjs" };
    return { js: ".js" };
  },
  esbuildOptions: (options) => {
    options.banner = {
      js: `
        import { createRequire } from 'module';

        const require = createRequire(import.meta.url);
        // Force Prisma to use bundled WASM
	//
        globalThis.process = globalThis.process || {};
	globalThis.process.env = globalThis.process.env || {};
	globalThis.process.env.PRISMA_QUERY_ENGINE_LIBRARY_TYPE = 'wasm';

        if (typeof globalThis.__dirname === "undefined") {
          globalThis.__dirname = new URL('.', import.meta.url).pathname;
        }
        if (typeof globalThis.__filename === "undefined") {
          globalThis.__filename = new URL(import.meta.url).pathname;
        }
      `,
    };

    // Define replacements for worker script paths
    options.define = {
      ...options.define,
      'process.env.NODE_ENV': '"production"',
    };

    // Handle loader and worker script resolution
    options.loader = {
      ...options.loader,
      '.node': 'copy',
    };
  },
  esbuildPlugins: [generatePackageJsonPlugin(), copyPrismaSchemaPlugin()],
});
