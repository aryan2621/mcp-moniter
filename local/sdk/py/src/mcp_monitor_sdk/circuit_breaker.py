import time
from enum import Enum

from .errors import CircuitBreakerError
from .logger import Logger


class CircuitState(str, Enum):
    CLOSED = "CLOSED"
    OPEN = "OPEN"
    HALF_OPEN = "HALF_OPEN"


class CircuitBreaker:
    def __init__(
        self,
        logger: Logger,
        *,
        failure_threshold: int = 5,
        success_threshold: int = 2,
        timeout_ms: int = 60_000,
    ):
        self._logger = logger
        self._failure_threshold = failure_threshold
        self._success_threshold = success_threshold
        self._timeout_ms = timeout_ms
        self._state = CircuitState.CLOSED
        self._failures = 0
        self._successes = 0
        self._last_failure = 0.0

    async def execute(self, fn):
        if self._state == CircuitState.OPEN:
            if (time.monotonic() * 1000) - self._last_failure > self._timeout_ms:
                self._logger.info("Circuit breaker transitioning to HALF_OPEN")
                self._state = CircuitState.HALF_OPEN
                self._successes = 0
            else:
                raise CircuitBreakerError(
                    "Circuit breaker is OPEN",
                    {"state": self._state.value, "failures": self._failures},
                )

        try:
            result = await fn()
            self._on_success()
            return result
        except Exception:
            self._on_failure()
            raise

    def _on_success(self) -> None:
        self._failures = 0
        if self._state == CircuitState.HALF_OPEN:
            self._successes += 1
            if self._successes >= self._success_threshold:
                self._logger.info("Circuit breaker transitioning to CLOSED")
                self._state = CircuitState.CLOSED
                self._successes = 0

    def _on_failure(self) -> None:
        self._failures += 1
        self._last_failure = time.monotonic() * 1000
        if (
            self._state == CircuitState.HALF_OPEN
            or self._failures >= self._failure_threshold
        ):
            self._logger.warn(
                "Circuit breaker transitioning to OPEN",
                failures=self._failures,
            )
            self._state = CircuitState.OPEN
