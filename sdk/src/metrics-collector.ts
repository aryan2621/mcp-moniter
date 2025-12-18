import type { ToolCallEvent } from "./types.js";
import type { Transport } from "./transport/transport.js";
import type { Logger } from "./logger/logger.js";
import { EventBuffer } from "./core/event-buffer.js";

export class MetricsCollector {
  private buffer: EventBuffer;
  private transport?: Transport;

  constructor(
    batchSize: number,
    private logger: Logger,
    transport?: Transport
  ) {
    this.buffer = new EventBuffer(batchSize);
    this.transport = transport;
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
      await this.flush();
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
      }
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
