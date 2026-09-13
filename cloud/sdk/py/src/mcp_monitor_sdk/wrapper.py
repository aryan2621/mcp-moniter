import asyncio
import inspect
import json
from datetime import datetime, timezone
from functools import wraps
from typing import Any, Callable
from uuid import uuid4

from .collector import MetricsCollector
from .types import ToolCallEvent


def _size(data: Any) -> int:
    try:
        return len(json.dumps(data, default=str))
    except TypeError:
        return 0


def _schedule(coro) -> None:
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        asyncio.run(coro)
        return
    loop.create_task(coro)


def wrap_tool(tool_name: str, fn: Callable, collector: MetricsCollector) -> Callable:
    def event(success: bool, duration: float, args: tuple, kwargs: dict, result: Any = None, error: Exception | None = None) -> ToolCallEvent:
        return ToolCallEvent(
            callId=str(uuid4()),
            toolName=tool_name,
            timestamp=datetime.now(timezone.utc).isoformat(),
            duration=duration,
            inputSize=_size({"args": args, "kwargs": kwargs}),
            outputSize=_size(result) if success else None,
            success=success,
            error=str(error) if error else None,
            errorStack=repr(error) if error else None,
        )

    if inspect.iscoroutinefunction(fn):

        @wraps(fn)
        async def async_wrapped(*args: Any, **kwargs: Any):
            start = datetime.now(timezone.utc)
            try:
                result = await fn(*args, **kwargs)
                duration = (datetime.now(timezone.utc) - start).total_seconds() * 1000
                await collector.record_event(event(True, duration, args, kwargs, result))
                return result
            except Exception as error:
                duration = (datetime.now(timezone.utc) - start).total_seconds() * 1000
                await collector.record_event(event(False, duration, args, kwargs, error=error))
                raise

        return async_wrapped

    @wraps(fn)
    def sync_wrapped(*args: Any, **kwargs: Any):
        start = datetime.now(timezone.utc)
        try:
            result = fn(*args, **kwargs)
            duration = (datetime.now(timezone.utc) - start).total_seconds() * 1000
            _schedule(collector.record_event(event(True, duration, args, kwargs, result)))
            return result
        except Exception as error:
            duration = (datetime.now(timezone.utc) - start).total_seconds() * 1000
            _schedule(collector.record_event(event(False, duration, args, kwargs, error=error)))
            raise

    return sync_wrapped
