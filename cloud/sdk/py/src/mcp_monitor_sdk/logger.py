import json
import sys
from datetime import datetime, timezone
from enum import IntEnum


class LogLevel(IntEnum):
    DEBUG = 0
    INFO = 1
    WARN = 2
    ERROR = 3
    SILENT = 4


_LEVEL_MAP = {
    "debug": LogLevel.DEBUG,
    "info": LogLevel.INFO,
    "warn": LogLevel.WARN,
    "error": LogLevel.ERROR,
    "silent": LogLevel.SILENT,
}


class Logger:
    def __init__(self, level: str, context: str = "MCP-Monitor"):
        self.min_level = _LEVEL_MAP.get(level, LogLevel.INFO)
        self.context = context

    def debug(self, message: str, **meta: object) -> None:
        self._log(LogLevel.DEBUG, message, meta)

    def info(self, message: str, **meta: object) -> None:
        self._log(LogLevel.INFO, message, meta)

    def warn(self, message: str, **meta: object) -> None:
        self._log(LogLevel.WARN, message, meta)

    def error(self, message: str, error: Exception | None = None, **meta: object) -> None:
        if error is not None:
            meta = {**meta, "error": str(error)}
        self._log(LogLevel.ERROR, message, meta)

    def _log(self, level: LogLevel, message: str, meta: dict[str, object]) -> None:
        if level < self.min_level or self.min_level == LogLevel.SILENT:
            return
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": level.name,
            "context": self.context,
            "message": message,
            **meta,
        }
        sys.stderr.write(json.dumps(entry) + "\n")
