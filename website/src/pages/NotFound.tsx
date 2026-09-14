import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { usePageTitle } from "../lib/utils";

export function NotFoundPage() {
  usePageTitle("Not found — MCP Monitor");

  return (
    <main className="mx-auto max-w-6xl px-6 py-24">
      <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
      <p className="mt-2 text-muted-foreground">That route is not part of this site.</p>
      <Button className="mt-6" asChild>
        <Link to="/">Back home</Link>
      </Button>
    </main>
  );
}
