import { CallPath } from "../components/CallPath";
import { CtaBand } from "../components/CtaBand";
import { Hero } from "../components/Hero";
import { LiveCall } from "../components/LiveCall";
import { usePageTitle } from "../lib/utils";

export function HomePage() {
  usePageTitle("MCP Monitor — Observability for MCP servers");

  return (
    <main>
      <Hero />
      <CallPath />
      <LiveCall />
      <CtaBand />
    </main>
  );
}
