import { Editions } from "../components/Editions";
import { usePageTitle } from "../lib/utils";

export function EditionsPage() {
  usePageTitle("Editions — MCP Monitor");

  return (
    <main>
      <Editions />
    </main>
  );
}
