import { App } from "@opentrader/bot";
import { getSettings } from "../../utils/settings.js";

console.log("🔧 OpenTrader Daemon Bundle - Starting up...");
console.log("📦 Bundle Type: Daemon");
console.log("⏰ Started at:", new Date().toISOString());

const { host, port } = getSettings();

console.log("🏗️ Daemon Bundle - Creating app instance...");
const app = await App.create({
  server: {
    frontendDistPath: "../frontend",
    host,
    port,
  },
});
console.log("✅ Daemon Bundle - App created successfully");

async function shutdown() {
  console.log("🛑 Daemon Bundle - Shutting down...");
  await app.shutdown();
  console.log("✅ Daemon Bundle - Shutdown complete");
  process.exit(0);
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
