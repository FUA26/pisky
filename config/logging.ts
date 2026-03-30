type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: string;
  data?: unknown;
}

class Logger {
  private context: string;

  constructor(context = "app") {
    this.context = context;
  }

  private log(level: LogLevel, message: string, data?: unknown) {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: this.context,
      data,
    };

    const logMessage = `[${entry.timestamp}] [${entry.level}] [${entry.context}] ${entry.message}`;

    switch (level) {
      case "error":
        console.error(logMessage, data || "");
        break;
      case "warn":
        console.warn(logMessage, data || "");
        break;
      case "debug":
        console.debug(logMessage, data || "");
        break;
      default:
        console.log(logMessage, data || "");
    }
  }

  debug(message: string, data?: unknown) {
    if (process.env.NODE_ENV === "development") {
      this.log("debug", message, data);
    }
  }

  info(message: string, data?: unknown) {
    this.log("info", message, data);
  }

  warn(message: string, data?: unknown) {
    this.log("warn", message, data);
  }

  error(message: string, data?: unknown) {
    this.log("error", message, data);
  }
}

export function createLogger(context: string) {
  return new Logger(context);
}

export const logger = new Logger("app");
export const dbLogger = new Logger("database");
export const authLogger = new Logger("auth");
export const apiLogger = new Logger("api");
