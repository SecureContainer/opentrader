import { pino } from "pino";

const logFile = process.env.LOG_FILE;
const isBundled = process.env.OPENTRADER_BUNDLED === "true";

export const logger = isBundled
  ? // Simplified configuration for bundled builds (no transport workers)
    pino({
      level: "info",
      prettyPrint: false,
    })
  : logFile
  ? pino({
      transport: {
        targets: [
          {
            target: "pino-pretty",
            options: {
              ignore: "pid,hostname",
              sync: true,
            },
          },
          {
            target: "pino/file",
            options: {
              destination: logFile,
            },
          },
        ],
      },
    })
  : pino({
      transport: {
        target: "pino-pretty",
        options: {
          ignore: "pid,hostname",
          sync: true,
        },
      },
    });
