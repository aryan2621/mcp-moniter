import type { Logger } from "../logger/logger.js";

export interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions,
  logger: Logger
): Promise<T> {
  let lastError: Error | undefined;
  let delay = options.initialDelay;

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt === options.maxAttempts) {
        logger.error("Retry attempts exhausted", lastError, {
          attempts: attempt,
          maxAttempts: options.maxAttempts,
        });
        break;
      }

      logger.warn("Operation failed, retrying", {
        attempt,
        maxAttempts: options.maxAttempts,
        delay,
        error: lastError.message,
      });

      await sleep(delay);

      delay = Math.min(delay * options.backoffMultiplier, options.maxDelay);
    }
  }

  throw lastError;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
