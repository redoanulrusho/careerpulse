import Link from "next/link";
import { Compass } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center">
      <Compass className="text-accent size-10" aria-hidden="true" />
      <h1 className="mt-4 text-3xl font-semibold tracking-tight">Page not found</h1>
      <p className="text-muted mt-2">That career path doesn&apos;t exist (yet). Let&apos;s get you back on track.</p>
      <Link href="/" className="bg-accent text-accent-fg mt-6 rounded-lg px-4 py-2 text-sm font-medium">
        Back to all careers
      </Link>
    </div>
  );
}
