import { CircuitBreakerError } from "../errors/index.js";
import type { Logger } from "../logger/logger.js";

export enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

export interface CircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures = 0;
  private successes = 0;
  private lastFailureTime = 0;

  constructor(
    private options: CircuitBreakerOptions,
    private logger: Logger
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.options.timeout) {
        this.logger.info("Circuit breaker transitioning to HALF_OPEN");
        this.state = CircuitState.HALF_OPEN;
        this.successes = 0;
      } else {
        throw new CircuitBreakerError("Circuit breaker is OPEN", {
          state: this.state,
          failures: this.failures,
        });
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successes++;
      if (this.successes >= this.options.successThreshold) {
        this.logger.info("Circuit breaker transitioning to CLOSED");
        this.state = CircuitState.CLOSED;
        this.successes = 0;
      }
    }
  }

  private onFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (
      this.state === CircuitState.HALF_OPEN ||
      this.failures >= this.options.failureThreshold
    ) {
      this.logger.warn("Circuit breaker transitioning to OPEN", {
        failures: this.failures,
        threshold: this.options.failureThreshold,
      });
      this.state = CircuitState.OPEN;
    }
  }

  getState(): CircuitState {
    return this.state;
  }

  reset(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.lastFailureTime = 0;
    this.logger.info("Circuit breaker reset");
  }
}
