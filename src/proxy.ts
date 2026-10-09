import { NextResponse, type NextRequest } from "next/server";

/** Every page address is lowercase, so a mixed-case link (/Band, /HOW-IT-WORKS)
 *  is sent permanently to its lowercase form instead of a 404. The matcher only
 *  runs this for paths that contain a capital letter, so ordinary requests skip
 *  it, and /studio, /api and /_next are left alone (Studio routes carry
 *  case-sensitive document ids). */
export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = url.pathname.toLowerCase();
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: "/((?!_next|api|studio).*[A-Z].*)",
};
