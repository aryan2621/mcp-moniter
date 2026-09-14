import { Link } from "react-router-dom";
import { LINKS } from "../links";
import { DashboardMock } from "./DashboardMock";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="mx-auto max-w-6xl space-y-10 px-6 pt-16 pb-12 sm:pt-24">
      <div>
        <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-6xl">
          Watch every MCP tool call.
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          Wrap a JavaScript or Python MCP server. Latency, success, and errors land in a dashboard.
          Not application logging.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button asChild>
            <a href={LINKS.dashboard} target="_blank" rel="noopener noreferrer">
              Open dashboard
            </a>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/sdk">SDK wrap</Link>
          </Button>
          <Button variant="ghost" asChild>
            <Link to="/editions">Hosted or self-host</Link>
          </Button>
        </div>
      </div>
      <DashboardMock />
    </section>
  );
}
