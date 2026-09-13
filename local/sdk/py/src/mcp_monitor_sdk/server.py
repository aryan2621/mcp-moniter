import atexit
from typing import Any

from mcp.server.fastmcp import FastMCP

from .collector import MetricsCollector
from .config import validate_monitor_options
from .logger import Logger
from .transport import HttpSender
from .wrapper import wrap_tool


class MonitoredFastMCP(FastMCP):
    """FastMCP server that batches tool-call metrics to a self-host instance."""

    def __init__(
        self,
        name: str,
        *,
        server_name: str,
        instance_secret: str,
        metrics_server_url: str,
        batch_size: int = 10,
        log_level: str = "info",
        timeout_ms: int = 5000,
        retry_attempts: int = 2,
        flush_interval_ms: int = 5000,
        **kwargs: Any,
    ):
        super().__init__(name, **kwargs)
        config = validate_monitor_options(
            server_name=server_name,
            instance_secret=instance_secret,
            metrics_server_url=metrics_server_url,
            batch_size=batch_size,
            log_level=log_level,
            timeout_ms=timeout_ms,
            retry_attempts=retry_attempts,
            flush_interval_ms=flush_interval_ms,
        )
        self._logger = Logger(config.log_level)
        self._logger.info(
            "Initializing MonitoredFastMCP",
            serverName=config.server_name,
            metricsUrl=config.metrics_server_url,
        )
        transport = HttpSender(
            config.metrics_server_url,
            config.server_name,
            config.instance_secret,
            config.timeout_ms,
            config.retry_attempts,
            self._logger,
        )
        self._collector = MetricsCollector(
            config.batch_size,
            self._logger,
            transport,
            config.flush_interval_ms,
        )
        atexit.register(self._shutdown)

    def add_tool(self, fn, name=None, **kwargs: Any):
        tool_name = name or getattr(fn, "__name__", "tool")
        wrapped = wrap_tool(tool_name, fn, self._collector)
        return super().add_tool(wrapped, name=name, **kwargs)

    async def flush_metrics(self) -> None:
        await self._collector.flush()

    def _shutdown(self) -> None:
        self._collector.stop()
        self._collector.drain_sync()
