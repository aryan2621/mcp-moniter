export interface ToolCallEvent {
  callId: string;
  toolName: string;
  timestamp: string;
  duration: number;
  inputSize: number;
  outputSize?: number;
  success: boolean;
  error?: string;
  errorStack?: string;
}

export interface MonitorOptions {
  apiKey: string;
  metricsServerUrl?: string;
  batchSize?: number;
  logLevel?: "debug" | "info" | "warn" | "error" | "silent";
  timeout?: number;
  retryAttempts?: number;
}
