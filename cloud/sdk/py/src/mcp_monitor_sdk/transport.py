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
        api_key: str,
        timeout_ms: int,
        retry_attempts: int,
        logger: Logger,
    ):
        self._url = url
        self._api_key = api_key
        self._timeout = timeout_ms / 1000
        self._retry_attempts = max(retry_attempts, 1)
        self._logger = logger
        self._breaker = CircuitBreaker(logger)

    def _payload(self, events: list[ToolCallEvent]) -> list[dict]:
        return [event.to_dict() for event in events]

    def _headers(self) -> dict[str, str]:
        return {
            "Content-Type": "application/json",
            "X-API-Key": self._api_key,
        }

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
                json=self._payload(events),
                headers=self._headers(),
            )
            response.raise_for_status()

    def send_sync(self, events: list[ToolCallEvent]) -> None:
        payload = json.dumps(self._payload(events)).encode("utf-8")
        request = urllib.request.Request(
            self._url,
            data=payload,
            headers=self._headers(),
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
