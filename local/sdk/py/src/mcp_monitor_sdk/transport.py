import json
import urllib.error
import urllib.request

import httpx

from .circuit_breaker import CircuitBreaker
from .errors import TransportError
from .logger import Logger
from .retry import with_retry
from .types import ToolCallEvent


class HttpSender:
    def __init__(
        self,
        url: str,
        server_name: str,
        instance_secret: str,
        timeout_ms: int,
        retry_attempts: int,
        logger: Logger,
    ):
        self._url = url
        self._server_name = server_name
        self._instance_secret = instance_secret
        self._timeout = timeout_ms / 1000
        self._retry_attempts = max(retry_attempts, 1)
        self._logger = logger
        self._breaker = CircuitBreaker(logger)

    async def send(self, events: list[ToolCallEvent]) -> None:
        try:
            await self._breaker.execute(
                lambda: with_retry(
                    lambda: self._send_request(events),
                    max_attempts=self._retry_attempts,
                    initial_delay=1.0,
                    max_delay=10.0,
                    backoff_multiplier=2.0,
                    logger=self._logger,
                )
            )
            self._logger.info("Metrics sent successfully", eventCount=len(events))
        except Exception as error:
            self._logger.error("Failed to send metrics", error, eventCount=len(events))
            raise TransportError(
                "HTTP transport failed",
                {
                    "url": self._url,
                    "eventCount": len(events),
                    "originalError": str(error),
                },
            ) from error

    async def _send_request(self, events: list[ToolCallEvent]) -> None:
        async with httpx.AsyncClient(timeout=self._timeout) as client:
            response = await client.post(
                self._url,
                json={
                    "serverName": self._server_name,
                    "events": [event.to_dict() for event in events],
                },
                headers={
                    "Content-Type": "application/json",
                    "X-Instance-Secret": self._instance_secret,
                },
            )
            response.raise_for_status()

    def send_sync(self, events: list[ToolCallEvent]) -> None:
        payload = json.dumps(
            {
                "serverName": self._server_name,
                "events": [event.to_dict() for event in events],
            }
        ).encode("utf-8")
        request = urllib.request.Request(
            self._url,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "X-Instance-Secret": self._instance_secret,
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(request, timeout=self._timeout) as response:
                if response.status >= 400:
                    raise TransportError(
                        "HTTP transport failed",
                        {
                            "url": self._url,
                            "eventCount": len(events),
                            "status": response.status,
                        },
                    )
            self._logger.info("Metrics sent successfully", eventCount=len(events))
        except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, OSError) as error:
            self._logger.error("Failed to send metrics", error, eventCount=len(events))
            raise TransportError(
                "HTTP transport failed",
                {
                    "url": self._url,
                    "eventCount": len(events),
                    "originalError": str(error),
                },
            ) from error
