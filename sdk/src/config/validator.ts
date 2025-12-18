import { z } from "zod";
import { ConfigurationError } from "../errors/index.js";

const DEFAULT_METRICS_SERVER_URL = "http://localhost:8000/v1/metrics";
const DEFAULT_TIMEOUT = 5000;
const DEFAULT_RETRY_ATTEMPTS = 2;
const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_LOG_LEVEL = "info";

export const MonitorOptionsSchema = z.object({
  apiKey: z.string().min(64),
  metricsServerUrl: z.string().url().optional(),
  batchSize: z.number().positive().optional(),
  logLevel: z.enum(["debug", "info", "warn", "error", "silent"]).optional(),
  timeout: z.number().positive().optional(),
  retryAttempts: z.number().nonnegative().optional(),
});

export interface ValidatedMonitorOptions {
  apiKey: string;
  batchSize: number;
  logLevel: "debug" | "info" | "warn" | "error" | "silent";
  metricsServerUrl: string;
  timeout: number;
  retryAttempts: number;
}

export function validateMonitorOptions(
  options?: unknown
): ValidatedMonitorOptions {
  try {
    const validated = MonitorOptionsSchema.parse(options || {});

    return {
      apiKey: validated.apiKey,
      batchSize: validated.batchSize ?? DEFAULT_BATCH_SIZE,
      logLevel: validated.logLevel ?? DEFAULT_LOG_LEVEL,
      metricsServerUrl: validated.metricsServerUrl ?? DEFAULT_METRICS_SERVER_URL,
      timeout: validated.timeout ?? DEFAULT_TIMEOUT,
      retryAttempts: validated.retryAttempts ?? DEFAULT_RETRY_ATTEMPTS,
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
