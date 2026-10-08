import Link from "next/link";
import { Activity, ListChecks } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { CompareNavLink } from "./compare-nav-link";

const NAV = [
  { href: "/#explore", label: "Explore" },
  { href: "/progress", label: "My progress" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex size-8 items-center justify-center rounded-lg bg-accent text-accent-fg">
            <Activity className="size-4" aria-hidden="true" />
          </span>
          <span className="text-base">
            Career<span className="text-accent">Pulse</span>
          </span>
        </Link>
        <nav aria-label="Main" className="ml-auto flex items-center gap-1 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden rounded-lg px-3 py-2 text-muted transition hover:bg-surface-2 hover:text-fg sm:inline-flex"
            >
              {item.label}
            </Link>
          ))}
          <CompareNavLink />
          <Link
            href="/progress"
            aria-label="My progress"
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted transition hover:bg-surface-2 hover:text-fg sm:hidden"
          >
            <ListChecks className="size-4" aria-hidden="true" />
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
