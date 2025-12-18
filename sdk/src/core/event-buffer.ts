import type { ToolCallEvent } from "../types.js";

export class EventBuffer {
  private events: ToolCallEvent[] = [];

  constructor(private maxSize: number) {}

  add(event: ToolCallEvent): void {
    this.events.push(event);
  }

  isFull(): boolean {
    return this.events.length >= this.maxSize;
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
