import asyncio

from .logger import Logger


async def with_retry(
    fn,
    *,
    max_attempts: int,
    initial_delay: float,
    max_delay: float,
    backoff_multiplier: float,
    logger: Logger,
):
    attempts = max(max_attempts, 1)
    delay = initial_delay
    last_error: Exception | None = None

    for attempt in range(1, attempts + 1):
        try:
            return await fn()
        except Exception as error:  # noqa: BLE001
            last_error = error
            if attempt == attempts:
                logger.error("Retry attempts exhausted", error, attempts=attempt)
                break
            logger.warn(
                "Operation failed, retrying",
                attempt=attempt,
                max_attempts=attempts,
                delay=delay,
                error=str(error),
            )
            await asyncio.sleep(delay)
            delay = min(delay * backoff_multiplier, max_delay)

    assert last_error is not None
    raise last_error
