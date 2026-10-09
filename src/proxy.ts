import { NextResponse, type NextRequest } from "next/server";

/** Every page address is lowercase, so a mixed-case link (/Band, /HOW-IT-WORKS)
 *  is sent permanently to its lowercase form instead of a 404. /studio, /api and
 *  /_next are left alone (Studio routes carry case-sensitive document ids).
 *
 *  The capital-letter check must happen here, not in the matcher: Vercel
 *  compiles matchers case-insensitively, so a matcher of [A-Z] matched every
 *  path and redirected lowercase pages to themselves in a loop. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === pathname.toLowerCase()) return NextResponse.next();
  const url = request.nextUrl.clone();
  url.pathname = pathname.toLowerCase();
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: "/((?!_next|api|studio).*)",
};
