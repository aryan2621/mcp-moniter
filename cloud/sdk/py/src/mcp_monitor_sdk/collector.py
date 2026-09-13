import asyncio
import threading

from .buffer import EventBuffer
from .config import DEFAULT_FLUSH_INTERVAL_MS, MAX_PENDING_EVENTS
from .logger import Logger
from .transport import HttpSender
from .types import ToolCallEvent


class MetricsCollector:
    def __init__(
        self,
        batch_size: int,
        logger: Logger,
        transport: HttpSender,
        flush_interval_ms: int = DEFAULT_FLUSH_INTERVAL_MS,
    ):
        self._buffer = EventBuffer(batch_size, MAX_PENDING_EVENTS, logger)
        self._logger = logger
        self._transport = transport
        self._stopped = False
        self._timer: threading.Timer | None = None
        self._arm(flush_interval_ms / 1000)

    def _arm(self, interval_sec: float) -> None:
        if self._stopped:
            return
        self._interval_sec = interval_sec
        self._timer = threading.Timer(interval_sec, self._tick)
        self._timer.daemon = True
        self._timer.start()

    def _tick(self) -> None:
        try:
            try:
                asyncio.get_running_loop()
            except RuntimeError:
                asyncio.run(self.flush())
        finally:
            self._arm(self._interval_sec)

    def _schedule_flush(self) -> None:
        thread = threading.Thread(target=lambda: asyncio.run(self.flush()), daemon=True)
        thread.start()

    async def record_event(self, event: ToolCallEvent) -> None:
        self._buffer.add(event)
        self._logger.debug(
            "Event recorded",
            toolName=event.toolName,
            success=event.success,
            duration=event.duration,
        )
        if self._buffer.is_full():
            self._schedule_flush()

    async def flush(self) -> None:
        events = self._buffer.flush()
        if not events:
            return
        self._logger.info("Flushing metrics batch", eventCount=len(events))
        try:
            await self._transport.send(events)
        except Exception as error:
            self._logger.error("Transport failed during flush", error, eventCount=len(events))
            self._buffer.restore(events)

    def drain_sync(self) -> None:
        events = self._buffer.flush()
        if not events:
            return
        self._logger.info("Draining metrics on shutdown", eventCount=len(events))
        try:
            self._transport.send_sync(events)
        except Exception as error:
            self._logger.error("Transport failed during shutdown drain", error, eventCount=len(events))

    def stop(self) -> None:
        self._stopped = True
        if self._timer:
            self._timer.cancel()
            self._timer = None

    def pending(self) -> list[ToolCallEvent]:
        return self._buffer.pending()
