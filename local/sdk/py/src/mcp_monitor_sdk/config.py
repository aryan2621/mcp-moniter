from dataclasses import dataclass
from urllib.parse import urlparse
from uuid import uuid4

from .errors import ConfigurationError

DEFAULT_TIMEOUT_MS = 5000
DEFAULT_RETRY_ATTEMPTS = 2
DEFAULT_BATCH_SIZE = 10
DEFAULT_FLUSH_INTERVAL_MS = 5000
DEFAULT_LOG_LEVEL = "info"

MAX_BATCH_SIZE = 100
MAX_RETRY_ATTEMPTS = 5
MAX_TIMEOUT_MS = 30_000
MAX_PENDING_EVENTS = 10_000
MAX_FLUSH_INTERVAL_MS = 60_000
LOG_LEVELS = ("debug", "info", "warn", "error", "silent")


@dataclass(frozen=True)
class MonitorOptions:
    server_name: str
    instance_secret: str
    metrics_server_url: str
    batch_size: int = DEFAULT_BATCH_SIZE
    log_level: str = DEFAULT_LOG_LEVEL
    timeout_ms: int = DEFAULT_TIMEOUT_MS
    retry_attempts: int = DEFAULT_RETRY_ATTEMPTS
    flush_interval_ms: int = DEFAULT_FLUSH_INTERVAL_MS


def unique_server_name(name: str) -> str:
    suffix = uuid4().hex[:8]
    base = name[: 255 - 1 - len(suffix)]
    return f"{base}-{suffix}"


def validate_monitor_options(
    server_name: str,
    instance_secret: str,
    metrics_server_url: str,
    batch_size: int = DEFAULT_BATCH_SIZE,
    log_level: str = DEFAULT_LOG_LEVEL,
    timeout_ms: int = DEFAULT_TIMEOUT_MS,
    retry_attempts: int = DEFAULT_RETRY_ATTEMPTS,
    flush_interval_ms: int = DEFAULT_FLUSH_INTERVAL_MS,
) -> MonitorOptions:
    name = server_name.strip().lower()
    if not name:
        raise ConfigurationError("server_name must be 1-255 characters")
    name = unique_server_name(name)
    if len(instance_secret) < 16:
        raise ConfigurationError("instance_secret must be at least 16 characters")
    parsed = urlparse(metrics_server_url)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ConfigurationError("metrics_server_url must be an http(s) URL")
    if not 1 <= batch_size <= MAX_BATCH_SIZE:
        raise ConfigurationError(f"batch_size must be 1-{MAX_BATCH_SIZE}")
    if log_level not in LOG_LEVELS:
        raise ConfigurationError(f"log_level must be one of {LOG_LEVELS}")
    if not 1 <= timeout_ms <= MAX_TIMEOUT_MS:
        raise ConfigurationError(f"timeout_ms must be 1-{MAX_TIMEOUT_MS}")
    if not 0 <= retry_attempts <= MAX_RETRY_ATTEMPTS:
        raise ConfigurationError(f"retry_attempts must be 0-{MAX_RETRY_ATTEMPTS}")
    if not 1 <= flush_interval_ms <= MAX_FLUSH_INTERVAL_MS:
        raise ConfigurationError(f"flush_interval_ms must be 1-{MAX_FLUSH_INTERVAL_MS}")

    return MonitorOptions(
        server_name=name,
        instance_secret=instance_secret,
        metrics_server_url=metrics_server_url,
        batch_size=batch_size,
        log_level=log_level,
        timeout_ms=timeout_ms,
        retry_attempts=retry_attempts,
        flush_interval_ms=flush_interval_ms,
    )
