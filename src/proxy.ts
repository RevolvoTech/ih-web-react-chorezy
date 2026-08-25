import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const LAUNCH_COUNTRY = "US";

export function proxy(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country")?.toUpperCase();

  // Vercel adds the country header in deployed environments. Its absence keeps
  // local development and non-Vercel previews usable.
  if (!country || country === LAUNCH_COUNTRY) {
    return NextResponse.next();
  }

  if (request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { message: "Chorezy is not available in your country right now." },
      { status: 403, headers: { "Cache-Control": "private, no-store" } },
    );
  }

  const unavailableUrl = request.nextUrl.clone();
  unavailableUrl.pathname = "/not-available";
  unavailableUrl.search = "";

  const response = NextResponse.rewrite(unavailableUrl);
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|not-available|favicon.ico|sitemap.xml|robots.txt|opengraph-image|twitter-image|.*\\.(?:png|jpg|jpeg|gif|webp|avif|svg|ico|css|js|map|woff|woff2)$).*)",
  ],
};
