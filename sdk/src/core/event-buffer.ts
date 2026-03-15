import type { ToolCallEvent } from "../types.js";
import type { Logger } from "../logger/logger.js";

export class EventBuffer {
  private events: ToolCallEvent[] = [];

  constructor(
    private batchSize: number,
    private maxPending: number,
    private logger?: Logger
  ) {}

  add(event: ToolCallEvent): void {
    if (this.events.length >= this.maxPending) {
      this.events.shift();
      this.logger?.warn("Event buffer at capacity; dropped oldest event", {
        maxPending: this.maxPending,
      });
    }
    this.events.push(event);
  }

  isFull(): boolean {
    return this.events.length >= this.batchSize;
  }

  flush(): ToolCallEvent[] {
    const eventsToSend = [...this.events];
    this.events = [];
    return eventsToSend;
  }

  getPending(): ToolCallEvent[] {
    return [...this.events];
  }

  size(): number {
    return this.events.length;
  }

  clear(): void {
    this.events = [];
  }
}
