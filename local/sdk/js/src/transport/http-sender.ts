import ky from "ky";
import type { ToolCallEvent } from "../types.js";
import type { Transport } from "./transport.js";
import type { Logger } from "../logger/logger.js";
import { TransportError } from "../errors/index.js";
import { CircuitBreaker } from "../resilience/circuit-breaker.js";
import { withRetry } from "../utils/retry.js";

export class HttpSender implements Transport {
  private circuitBreaker: CircuitBreaker;

  constructor(
    private url: string,
    private serverName: string,
    private instanceSecret: string,
    private timeout: number,
    private retryAttempts: number,
    private logger: Logger
  ) {
    this.circuitBreaker = new CircuitBreaker(
      {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 60000,
      },
      logger
    );
  }

  async send(events: ToolCallEvent[]): Promise<void> {
    try {
      await this.circuitBreaker.execute(() =>
        withRetry(
          () => this.sendRequest(events),
          {
            maxAttempts: Math.max(this.retryAttempts, 1),
            initialDelay: 1000,
            maxDelay: 10000,
            backoffMultiplier: 2,
          },
          this.logger
        )
      );

      this.logger.info("Metrics sent successfully", {
        eventCount: events.length,
        url: this.url,
      });
    } catch (error) {
      const err = error as Error;
      this.logger.error("Failed to send metrics", err, {
        eventCount: events.length,
        url: this.url,
      });

      throw new TransportError("HTTP transport failed", {
        url: this.url,
        eventCount: events.length,
        originalError: err.message,
      });
    }
  }

  private async sendRequest(events: ToolCallEvent[]): Promise<void> {
    await ky.post(this.url, {
      json: {
        serverName: this.serverName,
        events,
      },
      headers: {
        "Content-Type": "application/json",
        "X-Instance-Secret": this.instanceSecret,
      },
      timeout: this.timeout,
      retry: 0,
    });
  }
}
