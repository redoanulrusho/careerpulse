import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-line mt-20 border-t">
      <div className="text-muted mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm sm:grid-cols-[2fr_1fr_1fr] sm:px-6">
        <div className="space-y-2">
          <p className="text-fg font-semibold">CareerPulse</p>
          <p className="max-w-md">
            Free, research-based roadmaps for 20 trending tech careers, with a focus on Bangladesh, remote work and
            global markets. Salary figures are estimates from cited public sources and change over time — always check
            the linked source.
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-fg font-semibold">Explore</p>
          <ul className="space-y-1">
            <li>
              <Link className="hover:text-fg" href="/#explore">
                All careers
              </Link>
            </li>
            <li>
              <Link className="hover:text-fg" href="/compare">
                Compare fields
              </Link>
            </li>
            <li>
              <Link className="hover:text-fg" href="/progress">
                My progress
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-2">
          <p className="text-fg font-semibold">Data sources</p>
          <ul className="space-y-1">
            <li>
              <a className="hover:text-fg" href="https://www.bls.gov/ooh/" target="_blank" rel="noreferrer">
                US BLS Occupational Outlook
              </a>
            </li>
            <li>
              <a
                className="hover:text-fg"
                href="https://www.paylab.com/bd/salaryinfo/information-technology"
                target="_blank"
                rel="noreferrer"
              >
                Paylab Bangladesh
              </a>
            </li>
            <li>
              <a
                className="hover:text-fg"
                href="https://arc.dev/salaries/software-engineers-in-bangladesh"
                target="_blank"
                rel="noreferrer"
              >
                Arc remote salaries
              </a>
            </li>
          </ul>
        </div>
      </div>
      <p className="border-line text-muted border-t py-4 text-center text-xs">
        Content researched October 2026 · Built with Next.js, TypeScript and Tailwind CSS
      </p>
    </footer>
  );
}
