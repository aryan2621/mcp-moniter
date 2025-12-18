export class McpMonitorError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly context?: Record<string, unknown>
  ) {
    super(message);
    this.name = "McpMonitorError";
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      context: this.context,
      stack: this.stack,
    };
  }
}

export class TransportError extends McpMonitorError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "TRANSPORT_ERROR", context);
    this.name = "TransportError";
  }
}

export class ConfigurationError extends McpMonitorError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "CONFIGURATION_ERROR", context);
    this.name = "ConfigurationError";
  }
}

export class BufferOverflowError extends McpMonitorError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "BUFFER_OVERFLOW", context);
    this.name = "BufferOverflowError";
  }
}

export class ValidationError extends McpMonitorError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", context);
    this.name = "ValidationError";
  }
}

export class CircuitBreakerError extends McpMonitorError {
  constructor(message: string, context?: Record<string, unknown>) {
    super(message, "CIRCUIT_BREAKER_OPEN", context);
    this.name = "CircuitBreakerError";
  }
}
