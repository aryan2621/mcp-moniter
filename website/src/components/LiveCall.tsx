import { useEffect, useRef, useState } from "react";

const TOOL_NAME = "todos_list";
const ARGS = {};
const RESULT = { content: [{ type: "text", text: "No todos." }] };
const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_FLUSH_INTERVAL_MS = 5000;
const CALL_MS = 720;
const HOLD_MS = 380;

type ToolCallEvent = {
  callId: string;
  toolName: string;
  timestamp: string;
  duration: number;
  inputSize: number;
  outputSize?: number;
  success: boolean;
};

function payloadSize(data: unknown) {
  try {
    return JSON.stringify(data).length;
  } catch {
    return 0;
  }
}

function recordCall(duration: number): ToolCallEvent {
  return {
    callId: crypto.randomUUID(),
    toolName: TOOL_NAME,
    timestamp: new Date().toISOString(),
    duration,
    inputSize: payloadSize(ARGS),
    outputSize: payloadSize(RESULT),
    success: true,
  };
}

const EVENT_KEYS: (keyof ToolCallEvent)[] = [
  "callId",
  "toolName",
  "timestamp",
  "duration",
  "inputSize",
  "outputSize",
  "success",
];

export function LiveCall() {
  const paused = useRef(false);
  const [phase, setPhase] = useState<"running" | "recorded" | "flushing">("running");
  const [elapsed, setElapsed] = useState(0);
  const [event, setEvent] = useState<ToolCallEvent | null>(null);
  const [batch, setBatch] = useState<ToolCallEvent[]>([]);
  const [log, setLog] = useState<ToolCallEvent[]>([]);
  const [visibleKeys, setVisibleKeys] = useState(0);

  useEffect(() => {
    if (!event || phase === "running") {
      setVisibleKeys(0);
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVisibleKeys(EVENT_KEYS.length);
      return;
    }
    setVisibleKeys(0);
    let n = 0;
    const id = window.setInterval(() => {
      n += 1;
      setVisibleKeys(n);
      if (n >= EVENT_KEYS.length) window.clearInterval(id);
    }, 55);
    return () => window.clearInterval(id);
  }, [event, phase]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) {
      const sample = recordCall(0);
      setEvent(sample);
      setPhase("recorded");
      setVisibleKeys(EVENT_KEYS.length);
      setBatch([sample]);
      setLog([sample]);
      return;
    }

    let cancelled = false;
    let raf = 0;
    let timeout = 0;
    let buffer: ToolCallEvent[] = [];
    let armedAt: number | null = null;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeout = window.setTimeout(resolve, ms);
      });

    const run = async () => {
      while (!cancelled) {
        while (paused.current && !cancelled) {
          await wait(120);
        }
        if (cancelled) return;

        setPhase("running");
        setEvent(null);
        setElapsed(0);
        const start = performance.now();

        await new Promise<void>((resolve) => {
          const tick = (now: number) => {
            if (cancelled) {
              resolve();
              return;
            }
            setElapsed(Math.max(0, Math.round(now - start)));
            if (now - start >= CALL_MS) {
              resolve();
              return;
            }
            raf = requestAnimationFrame(tick);
          };
          raf = requestAnimationFrame(tick);
        });
        if (cancelled) return;

        const duration = Math.max(0, Math.round(performance.now() - start));
        const next = recordCall(duration);
        setElapsed(duration);
        setEvent(next);
        setPhase("recorded");
        setLog((rows) => [next, ...rows].slice(0, 5));

        if (armedAt === null) armedAt = performance.now();
        buffer = [...buffer, next];
        setBatch(buffer);

        await wait(HOLD_MS);
        if (cancelled) return;

        const due =
          buffer.length >= DEFAULT_BATCH_SIZE ||
          (armedAt !== null && performance.now() - armedAt >= DEFAULT_FLUSH_INTERVAL_MS);

        if (due) {
          setPhase("flushing");
          await wait(480);
          if (cancelled) return;
          buffer = [];
          armedAt = null;
          setBatch([]);
        }
      }
    };

    void run();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(timeout);
    };
  }, []);

  return (
    <section className="border-y">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div
          className="mm-scan overflow-hidden rounded-lg border"
          onMouseEnter={() => {
            paused.current = true;
          }}
          onMouseLeave={() => {
            paused.current = false;
          }}
        >
          <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2 font-mono text-[11px]">
            <span className="flex items-center gap-2">
              <span className="mm-rec inline-block h-2 w-2 rounded-full bg-destructive" />
              REC
              <span className="text-muted-foreground">{TOOL_NAME}</span>
            </span>
            <span className="text-muted-foreground">
              {phase === "flushing" ? "POST /v1/metrics" : `batch ${batch.length}/${DEFAULT_BATCH_SIZE}`}
            </span>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <div className="flex flex-col justify-center gap-4 border-b px-6 py-10 lg:border-r lg:border-b-0">
              <p className="font-mono text-6xl tabular-nums tracking-tight sm:text-7xl">
                {phase === "running" ? elapsed : (event?.duration ?? elapsed)}
                <span className="ml-2 text-2xl text-muted-foreground">ms</span>
                {phase === "running" ? <span className="mm-caret text-primary">▌</span> : null}
              </p>
              <div className="flex gap-1">
                {Array.from({ length: DEFAULT_BATCH_SIZE }, (_, index) => (
                  <span
                    key={index}
                    className={`h-7 flex-1 rounded-sm ${
                      index < batch.length ? "bg-primary mm-pulse-line" : "bg-muted"
                    } ${phase === "flushing" && index < batch.length ? "mm-flush" : ""}`}
                  />
                ))}
              </div>
            </div>

            <pre className="overflow-x-auto bg-muted/20 px-6 py-8 font-mono text-[13px] leading-7">
              <code>
                {"{\n"}
                {EVENT_KEYS.map((key, index) => {
                  if (!event || index >= visibleKeys) {
                    return (
                      <span key={key} className="block text-muted-foreground/35">
                        {"  "}
                        {key}
                      </span>
                    );
                  }
                  const value = event[key];
                  const rendered = typeof value === "string" ? `"${value}"` : String(value);
                  return (
                    <span key={`${event.callId}-${key}`} className="mm-field-in block">
                      {"  "}
                      <span className="text-muted-foreground">{key}</span>
                      {": "}
                      {rendered}
                      {index < EVENT_KEYS.length - 1 ? "," : ""}
                    </span>
                  );
                })}
                {"}"}
              </code>
            </pre>
          </div>

          <ul className="divide-y border-t font-mono text-[11px]">
            {log.length === 0 ? (
              <li className="px-4 py-2 text-muted-foreground">Waiting for the first wrap…</li>
            ) : (
              log.map((row) => (
                <li key={row.callId} className="mm-field-in grid grid-cols-[auto_1fr_auto_auto] gap-4 px-4 py-1.5">
                  <span className="text-muted-foreground">{row.timestamp.slice(11, 23)}</span>
                  <span>{row.toolName}</span>
                  <span className="tabular-nums">{row.duration}ms</span>
                  <span>ok</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
