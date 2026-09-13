import threading

from .logger import Logger
from .types import ToolCallEvent


class EventBuffer:
    def __init__(self, batch_size: int, max_pending: int, logger: Logger):
        self._batch_size = batch_size
        self._max_pending = max_pending
        self._logger = logger
        self._events: list[ToolCallEvent] = []
        self._lock = threading.Lock()

    def add(self, event: ToolCallEvent) -> None:
        with self._lock:
            if len(self._events) >= self._max_pending:
                self._events.pop(0)
                self._logger.warn("Event buffer at capacity; dropped oldest event")
            self._events.append(event)

    def is_full(self) -> bool:
        with self._lock:
            return len(self._events) >= self._batch_size

    def flush(self) -> list[ToolCallEvent]:
        with self._lock:
            events = list(self._events)
            self._events.clear()
            return events

    def restore(self, events: list[ToolCallEvent]) -> None:
        if not events:
            return
        with self._lock:
            self._events = list(events) + self._events
            while len(self._events) > self._max_pending:
                self._events.pop()
                self._logger.warn("Event buffer at capacity; dropped newest event after restore")

    def pending(self) -> list[ToolCallEvent]:
        with self._lock:
            return list(self._events)

    def size(self) -> int:
        with self._lock:
            return len(self._events)

    def clear(self) -> None:
        with self._lock:
            self._events.clear()
