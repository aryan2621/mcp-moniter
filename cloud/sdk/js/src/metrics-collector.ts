import type { ToolCallEvent } from "./types.js";
import type { Transport } from "./transport/transport.js";
import type { Logger } from "./logger/logger.js";
import { EventBuffer } from "./core/event-buffer.js";
import { MONITOR_LIMITS } from "./config/validator.js";

export class MetricsCollector {
  private buffer: EventBuffer;
  private transport?: Transport;
  private flushTimer?: ReturnType<typeof setInterval>;

  constructor(
    batchSize: number,
    private logger: Logger,
    transport?: Transport,
    maxPending = MONITOR_LIMITS.MAX_PENDING_EVENTS,
    flushIntervalMs = 5000
  ) {
    this.buffer = new EventBuffer(batchSize, maxPending, logger);
    this.transport = transport;
    this.flushTimer = setInterval(() => {
      void this.flush();
    }, flushIntervalMs);
  }

  async recordEvent(event: ToolCallEvent): Promise<void> {
    this.buffer.add(event);

    this.logger.debug("Event recorded", {
      toolName: event.toolName,
      success: event.success,
      duration: event.duration,
      bufferSize: this.buffer.size(),
    });

    if (this.buffer.isFull()) {
      void this.flush();
    }
  }

  async flush(): Promise<void> {
    const events = this.buffer.flush();

    if (events.length === 0) {
      return;
    }

    this.logger.info("Flushing metrics batch", {
      eventCount: events.length,
    });

    if (this.transport) {
      try {
        await this.transport.send(events);
      } catch (error) {
        const err = error as Error;
        this.logger.error("Transport failed during flush", err, {
          eventCount: events.length,
        });
        this.buffer.restore(events);
      }
    }
  }

  stop(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = undefined;
    }
  }

  getPendingEvents(): ToolCallEvent[] {
    return this.buffer.getPending();
  }

  getPendingCount(): number {
    return this.buffer.size();
  }

  clear(): void {
    this.buffer.clear();
    this.logger.debug("Buffer cleared");
  }
}
