import { randomUUID } from "node:crypto";
import type { ToolCallEvent } from "../types.js";

export class EventWrapper {
  wrapCallback<TArgs, TResult>(
    toolName: string,
    originalCallback: (args: TArgs, extra: any) => Promise<TResult> | TResult,
    onEvent: (event: ToolCallEvent) => Promise<void>
  ): (args: TArgs, extra: any) => Promise<TResult> {
    return async (args: TArgs, extra: any) => {
      const startTime = Date.now();
      const callId = randomUUID();

      try {
        const result = await originalCallback(args, extra);
        const duration = Date.now() - startTime;

        const event: ToolCallEvent = {
          callId,
          toolName,
          timestamp: new Date().toISOString(),
          duration,
          inputSize: this.calculateSize(args),
          outputSize: this.calculateSize(result),
          success: true,
        };

        await onEvent(event);

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        const err = error as Error;

        const event: ToolCallEvent = {
          callId,
          toolName,
          timestamp: new Date().toISOString(),
          duration,
          inputSize: this.calculateSize(args),
          success: false,
          error: err.message,
          errorStack: err.stack,
        };

        await onEvent(event);

        throw error;
      }
    };
  }

  private calculateSize(data: unknown): number {
    try {
      return JSON.stringify(data).length;
    } catch {
      return 0;
    }
  }
}
