import { NextResponse, type NextRequest } from "next/server";
import { FIELD_SLUGS } from "@/data/fields/slugs";

const known = new Set<string>(FIELD_SLUGS);

/**
 * Field pages stream their content, so a notFound() thrown during rendering
 * would keep a 200 status. Rejecting unknown slugs here, before rendering,
 * gives crawlers and link checkers a real 404.
 */
export function proxy(request: NextRequest) {
  const slug = request.nextUrl.pathname.split("/")[2] ?? "";
  if (known.has(slug)) return NextResponse.next();
  return NextResponse.rewrite(new URL("/not-found-page", request.url), { status: 404 });
}

export const config = {
  matcher: "/fields/:slug",
};
