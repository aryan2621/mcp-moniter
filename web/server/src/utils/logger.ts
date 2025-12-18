import { getEnv } from "../config/env.js";

export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
}

export class Logger {
    private static minLevel: LogLevel = LogLevel.INFO;

    static initialize() {
        const env = getEnv();
        const levelMap: Record<string, LogLevel> = {
            debug: LogLevel.DEBUG,
            info: LogLevel.INFO,
            warn: LogLevel.WARN,
            error: LogLevel.ERROR,
        };
        Logger.minLevel = levelMap[env.LOG_LEVEL] ?? LogLevel.INFO;
    }

    constructor(private context: string) {}

    debug(message: string, meta?: Record<string, unknown>): void {
        this.log(LogLevel.DEBUG, message, meta);
    }

    info(message: string, meta?: Record<string, unknown>): void {
        this.log(LogLevel.INFO, message, meta);
    }

    warn(message: string, meta?: Record<string, unknown>): void {
        this.log(LogLevel.WARN, message, meta);
    }

    error(
        message: string,
        error?: Error,
        meta?: Record<string, unknown>
    ): void {
        this.log(LogLevel.ERROR, message, {
            ...meta,
            ...(error && {
                error: error.message,
                stack: error.stack,
            }),
        });
    }

    private log(
        level: LogLevel,
        message: string,
        meta?: Record<string, unknown>
    ): void {
        if (level < Logger.minLevel) {
            return;
        }

        const entry = {
            timestamp: new Date().toISOString(),
            level: LogLevel[level],
            context: this.context,
            message,
            ...meta,
        };

        // Use process.env directly to avoid circular dependency
        const isDevelopment = process.env.NODE_ENV === "development";

        if (isDevelopment) {
            // Formatted output for development
            const timestamp = new Date().toLocaleTimeString();
            const levelColors: Record<string, string> = {
                DEBUG: "\x1b[36m", // Cyan
                INFO: "\x1b[32m", // Green
                WARN: "\x1b[33m", // Yellow
                ERROR: "\x1b[31m", // Red
            };
            const reset = "\x1b[0m";
            const levelColor = levelColors[LogLevel[level]] || "";

            let output = `${levelColor}[${timestamp}] ${LogLevel[level]}${reset} [${this.context}] ${message}`;

            if (meta && Object.keys(meta).length > 0) {
                output += `\n  ${JSON.stringify(meta, null, 2).split("\n").join("\n  ")}`;
            }

            if (level === LogLevel.ERROR) {
                console.error(output);
            } else if (level === LogLevel.WARN) {
                console.warn(output);
            } else {
                console.log(output);
            }
        } else {
            // JSON output for production
            const output = JSON.stringify(entry);

            if (level === LogLevel.ERROR) {
                console.error(output);
            } else if (level === LogLevel.WARN) {
                console.warn(output);
            } else {
                console.log(output);
            }
        }
    }
}
