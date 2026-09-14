import { Link } from "react-router-dom";
import { LINKS } from "../links";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-3xl font-bold tracking-tight">Wrap a server. Open a dashboard.</h2>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/sdk">SDK wrap</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/editions">Hosted or self-host</Link>
        </Button>
        <Button variant="ghost" asChild>
          <a href={LINKS.dashboard} target="_blank" rel="noopener noreferrer">
            Open dashboard
          </a>
        </Button>
      </div>
    </section>
  );
}
