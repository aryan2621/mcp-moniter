import { randomBytes } from "node:crypto";
import { z } from "zod";
import { ConfigurationError } from "../errors/index.js";

const DEFAULT_TIMEOUT = 5000;
const DEFAULT_RETRY_ATTEMPTS = 2;
const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_FLUSH_INTERVAL_MS = 5000;
const DEFAULT_LOG_LEVEL = "info";

export const MONITOR_LIMITS = {
  MAX_BATCH_SIZE: 100,
  MAX_RETRY_ATTEMPTS: 5,
  MAX_TIMEOUT_MS: 30_000,
  MAX_PENDING_EVENTS: 10_000,
  MAX_FLUSH_INTERVAL_MS: 60_000,
} as const;

export const MonitorOptionsSchema = z.object({
  serverName: z.string().trim().min(1).max(255),
  instanceSecret: z.string().min(16),
  metricsServerUrl: z.string().url(),
  batchSize: z
    .number()
    .positive()
    .max(MONITOR_LIMITS.MAX_BATCH_SIZE)
    .optional(),
  logLevel: z.enum(["debug", "info", "warn", "error", "silent"]).optional(),
  timeout: z
    .number()
    .positive()
    .max(MONITOR_LIMITS.MAX_TIMEOUT_MS)
    .optional(),
  retryAttempts: z
    .number()
    .nonnegative()
    .max(MONITOR_LIMITS.MAX_RETRY_ATTEMPTS)
    .optional(),
  flushIntervalMs: z
    .number()
    .positive()
    .max(MONITOR_LIMITS.MAX_FLUSH_INTERVAL_MS)
    .optional(),
});

export interface ValidatedMonitorOptions {
  serverName: string;
  instanceSecret: string;
  metricsServerUrl: string;
  batchSize: number;
  logLevel: "debug" | "info" | "warn" | "error" | "silent";
  timeout: number;
  retryAttempts: number;
  flushIntervalMs: number;
}

export function uniqueServerName(name: string): string {
  const suffix = randomBytes(4).toString("hex");
  const base = name.slice(0, 255 - 1 - suffix.length);
  return `${base}-${suffix}`;
}

export function validateMonitorOptions(
  options?: unknown
): ValidatedMonitorOptions {
  try {
    const validated = MonitorOptionsSchema.parse(options || {});

    return {
      serverName: uniqueServerName(validated.serverName.trim().toLowerCase()),
      instanceSecret: validated.instanceSecret,
      metricsServerUrl: validated.metricsServerUrl,
      batchSize: validated.batchSize ?? DEFAULT_BATCH_SIZE,
      logLevel: validated.logLevel ?? DEFAULT_LOG_LEVEL,
      timeout: validated.timeout ?? DEFAULT_TIMEOUT,
      retryAttempts: validated.retryAttempts ?? DEFAULT_RETRY_ATTEMPTS,
      flushIntervalMs: validated.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ConfigurationError("Invalid monitor options configuration", {
        errors: error.issues,
        received: options,
      });
    }
    throw error;
  }
}
