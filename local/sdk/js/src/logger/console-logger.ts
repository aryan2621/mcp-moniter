import type { Logger, LogEntry, LogLevel } from "./logger.js";

export class ConsoleLogger implements Logger {
  constructor(
    private minLevel: LogLevel,
    private name: string = "MCP-SDK"
  ) { }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log("DEBUG", message, undefined, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log("INFO", message, undefined, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log("WARN", message, undefined, context);
  }

  error(
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    this.log("ERROR", message, error, context);
  }

  private log(
    level: string,
    message: string,
    error?: Error,
    context?: Record<string, unknown>
  ): void {
    const levelValue = this.getLevelValue(level);
    if (levelValue < this.minLevel) {
      return;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: context
        ? { ...context, logger: this.name }
        : { logger: this.name },
      error,
    };

    const output = this.format(entry);

    if (level === "ERROR") {
      console.error(output);
    } else if (level === "WARN") {
      console.error(output);
    } else {
      console.error(output);
    }
  }

  private format(entry: LogEntry): string {
    const base = JSON.stringify({
      timestamp: entry.timestamp,
      level: entry.level,
      message: entry.message,
      ...entry.context,
      ...(entry.error && {
        error: entry.error.message,
        stack: entry.error.stack,
      }),
    });
    return base;
  }

  private getLevelValue(level: string): number {
    const levels: Record<string, number> = {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3,
    };
    return levels[level] ?? 1;
  }
}
