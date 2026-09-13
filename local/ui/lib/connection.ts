const STORAGE_KEY = "mcp-monitor-connection";

export interface ConnectionConfig {
  serverUrl: string;
  instanceSecret: string;
}

const listeners = new Set<() => void>();

let cachedRaw: string | null | undefined;
let cachedValue: ConnectionConfig | null = null;

function parseConnection(raw: string | null): ConnectionConfig | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as ConnectionConfig;
    if (!parsed.serverUrl || !parsed.instanceSecret) return null;
    return parsed;
  } catch {
    return null;
  }
}

function readRaw(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(STORAGE_KEY);
}

function emit(): void {
  cachedRaw = undefined;
  listeners.forEach((listener) => listener());
}

export function subscribeConnection(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getConnection(): ConnectionConfig | null {
  if (typeof window === "undefined") return null;
  const raw = readRaw();
  if (raw === cachedRaw) return cachedValue;
  cachedRaw = raw;
  cachedValue = parseConnection(raw);
  return cachedValue;
}

export function setConnection(config: ConnectionConfig): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  emit();
}

export function clearConnection(): void {
  window.localStorage.removeItem(STORAGE_KEY);
  emit();
}

export function hasConnection(): boolean {
  return getConnection() !== null;
}

export function apiBaseUrl(connection = getConnection()): string {
  if (!connection) return "";
  return connection.serverUrl.replace(/\/$/, "");
}
