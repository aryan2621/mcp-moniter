class McpMonitorError(Exception):
    def __init__(self, message: str, code: str, context: dict | None = None):
        super().__init__(message)
        self.code = code
        self.context = context or {}


class TransportError(McpMonitorError):
    def __init__(self, message: str, context: dict | None = None):
        super().__init__(message, "TRANSPORT_ERROR", context)


class ConfigurationError(McpMonitorError):
    def __init__(self, message: str, context: dict | None = None):
        super().__init__(message, "CONFIGURATION_ERROR", context)


class CircuitBreakerError(McpMonitorError):
    def __init__(self, message: str, context: dict | None = None):
        super().__init__(message, "CIRCUIT_BREAKER_OPEN", context)
