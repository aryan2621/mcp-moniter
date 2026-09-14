import { LINKS } from "../links";
import { Button } from "@/components/ui/button";

export function Editions() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-6">
        <h1 className="text-3xl font-bold tracking-tight">Same metrics. Two places they live.</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">Do not mix SDKs, auth headers, or ingest bodies.</p>
      </div>

      <div className="mt-10 grid lg:grid-cols-[1fr_auto_1fr]">
        <article className="border-y px-6 py-10 lg:border-r lg:px-10">
          <div className="ml-auto max-w-xl space-y-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Hosted</p>
            <h2 className="text-4xl font-bold tracking-tight">Cloud dashboard</h2>
            <p className="text-sm text-muted-foreground">
              Clerk sign-in, per-server API keys, Workers ingest. Identity comes from the key.
            </p>
            <ul className="space-y-1 font-mono text-sm text-muted-foreground">
              <li>
                <a className="text-foreground underline-offset-4 hover:underline" href={LINKS.npm} target="_blank" rel="noopener noreferrer">
                  mcp-monitor-sdk
                </a>
                {" · "}
                <a className="text-foreground underline-offset-4 hover:underline" href={LINKS.pypi} target="_blank" rel="noopener noreferrer">
                  PyPI
                </a>
              </li>
              <li>X-API-Key</li>
              <li>JSON array of events</li>
              <li>Postgres + Influx</li>
            </ul>
            <Button asChild>
              <a href={LINKS.dashboard} target="_blank" rel="noopener noreferrer">
                Open hosted dashboard
              </a>
            </Button>
          </div>
        </article>

        <div className="flex items-center justify-center border-y bg-muted px-3 py-3">
          <p className="mm-pulse-line max-w-[10rem] text-center font-mono text-[11px] uppercase tracking-[0.2em] lg:max-w-none lg:rotate-180 lg:[writing-mode:vertical-rl]">
            Do not mix
          </p>
        </div>

        <article className="border-y px-6 py-10 lg:px-10">
          <div className="max-w-xl space-y-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Self-host</p>
            <h2 className="text-4xl font-bold tracking-tight">Your infrastructure</h2>
            <p className="text-sm text-muted-foreground">
              Docker Compose API + Postgres. Connect the UI or desktop app with the instance secret.
            </p>
            <ul className="space-y-1 font-mono text-sm text-muted-foreground">
              <li>
                <a className="text-foreground underline-offset-4 hover:underline" href={LINKS.npmLocal} target="_blank" rel="noopener noreferrer">
                  mcp-monitor-local-sdk
                </a>
                {" · "}
                <a className="text-foreground underline-offset-4 hover:underline" href={LINKS.pypiLocal} target="_blank" rel="noopener noreferrer">
                  PyPI
                </a>
              </li>
              <li>X-Instance-Secret</li>
              <li>{"{ serverName, events }"}</li>
              <li>Desktop is a window around the UI — you still run the API</li>
            </ul>
            <Button variant="outline" asChild>
              <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
                View the repo
              </a>
            </Button>
          </div>
        </article>
      </div>
    </section>
  );
}
