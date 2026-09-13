from dataclasses import dataclass
from typing import Any


@dataclass
class ToolCallEvent:
    callId: str
    toolName: str
    timestamp: str
    duration: float
    inputSize: int
    success: bool
    outputSize: int | None = None
    error: str | None = None
    errorStack: str | None = None

    def to_dict(self) -> dict[str, Any]:
        payload: dict[str, Any] = {
            "callId": self.callId,
            "toolName": self.toolName,
            "timestamp": self.timestamp,
            "duration": self.duration,
            "inputSize": self.inputSize,
            "success": self.success,
        }
        if self.outputSize is not None:
            payload["outputSize"] = self.outputSize
        if self.error is not None:
            payload["error"] = self.error
        if self.errorStack is not None:
            payload["errorStack"] = self.errorStack
        return payload
