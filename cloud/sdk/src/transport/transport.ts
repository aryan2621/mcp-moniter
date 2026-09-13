import type { ToolCallEvent } from "../types.js";

export interface Transport {
  send(events: ToolCallEvent[]): Promise<void>;
}
