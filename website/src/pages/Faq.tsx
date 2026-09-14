import { Faq } from "../components/Faq";
import { usePageTitle } from "../lib/utils";

export function FaqPage() {
  usePageTitle("FAQ — MCP Monitor");

  return (
    <main>
      <Faq />
    </main>
  );
}
