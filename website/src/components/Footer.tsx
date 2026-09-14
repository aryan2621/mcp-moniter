import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { LINKS } from "../links";
import { Button } from "@/components/ui/button";

const groups = [
  {
    title: "Site",
    links: [
      { href: "/", label: "Home", internal: true },
      { href: "/sdk", label: "SDK", internal: true },
      { href: "/editions", label: "Editions", internal: true },
      { href: "/faq", label: "FAQ", internal: true },
    ],
  },
  {
    title: "Product",
    links: [
      { href: LINKS.dashboard, label: "Hosted dashboard" },
      { href: LINKS.userGuide, label: "User guide" },
      { href: LINKS.releases, label: "Desktop releases" },
      { href: LINKS.github, label: "GitHub" },
    ],
  },
  {
    title: "Packages",
    links: [
      { href: LINKS.npm, label: "npm · mcp-monitor-sdk" },
      { href: LINKS.npmLocal, label: "npm · mcp-monitor-local-sdk" },
      { href: LINKS.pypi, label: "PyPI · mcp-monitor-sdk" },
      { href: LINKS.pypiLocal, label: "PyPI · mcp-monitor-local-sdk" },
      { href: LINKS.docker, label: "Docker Hub" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:grid-cols-[1.2fr_2fr]">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <img src={logo} alt="" className="h-7 w-7 rounded-md" width={28} height={28} />
            <span className="font-bold">MCP Monitor</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Tool-call metrics for MCP servers. Hosted or self-host. Not application logging.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-medium">{group.title}</p>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Button variant="link" className="h-auto p-0 text-muted-foreground" asChild>
                      {"internal" in link && link.internal ? (
                        <Link to={link.href}>{link.label}</Link>
                      ) : (
                        <a href={link.href} target="_blank" rel="noopener noreferrer">
                          {link.label}
                        </a>
                      )}
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t">
        <p className="mx-auto max-w-6xl px-6 py-4 text-xs text-muted-foreground">
          MCP Monitor · hosted and self-host editions
        </p>
      </div>
    </footer>
  );
}
