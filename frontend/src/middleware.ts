import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication
const PROTECTED_PREFIXES = ["/chat", "/flashcards", "/quiz"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) return NextResponse.next();

  const hasSession = request.cookies.getAll().some(
    (c) => c.name.startsWith("sb-") && c.name.includes("-auth-token")
  );

  if (!hasSession) {
    const loginUrl = new URL("/auth", request.url);
    loginUrl.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/flashcards/:path*", "/quiz/:path*"],
};
