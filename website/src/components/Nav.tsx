import { Menu } from "lucide-react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logo from "../assets/logo.png";
import { LINKS } from "../links";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";

const navItems = [
  { to: "/sdk", label: "SDK" },
  { to: "/editions", label: "Editions" },
  { to: "/faq", label: "FAQ" },
];

export function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-6">
        <Link to="/" className="mr-6 flex items-center space-x-2" onClick={() => setOpen(false)}>
          <img src={logo} alt="" className="h-7 w-7 rounded-md" width={28} height={28} />
          <span className="hidden font-bold sm:inline-block">MCP Monitor</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `transition-colors hover:text-foreground ${isActive ? "text-foreground" : ""}`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <a
            href={LINKS.userGuide}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Docs
          </a>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" className="hidden md:inline-flex" asChild>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </Button>
          <ThemeToggle />
          <Button className="hidden md:inline-flex" asChild>
            <a href={LINKS.dashboard} target="_blank" rel="noopener noreferrer">
              Open dashboard
            </a>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((value) => !value)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3 text-sm">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} onClick={() => setOpen(false)}>
                {item.label}
              </NavLink>
            ))}
            <a href={LINKS.userGuide} target="_blank" rel="noopener noreferrer">
              Docs
            </a>
            <a href={LINKS.github} target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <Button asChild>
              <a href={LINKS.dashboard} target="_blank" rel="noopener noreferrer">
                Open dashboard
              </a>
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
