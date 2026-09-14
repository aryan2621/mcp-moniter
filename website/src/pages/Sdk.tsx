import { CodeSample } from "../components/CodeSample";
import { usePageTitle } from "../lib/utils";

export function SdkPage() {
  usePageTitle("SDK — MCP Monitor");

  return (
    <main>
      <CodeSample />
    </main>
  );
}
