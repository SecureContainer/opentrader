import { App } from "@opentrader/bot";

console.log("🌟 OpenTrader Standalone Bundle - Starting up...");
console.log("📦 Bundle Type: Standalone");
console.log("⏰ Started at:", new Date().toISOString());

console.log("🏗️ Standalone Bundle - Creating app instance...");
const app = await App.create({
  server: {
    frontendDistPath: "../frontend",
    host: process.env.HOST || "localhost",
    port: Number(process.env.PORT) || 4000,
  },
});
console.log("✅ Standalone Bundle - App created successfully");

async function shutdown() {
  console.log("🛑 Standalone Bundle - Shutting down...");
  await app.shutdown();
  console.log("✅ Standalone Bundle - Shutdown complete");
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
