import { randomUUID } from "node:crypto";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

function buildCsp(nonce: string): string {
  const scriptSrc =
    process.env.NODE_ENV === "development"
      ? // Dev (Turbopack) precisa de eval/inline para HMR
        `script-src 'self' 'unsafe-inline' 'unsafe-eval' blob:`
      : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;
  return [
    "default-src 'self'",
    "img-src 'self' data: blob: https://pub-20ea17ad5d694dbc94202efa1ea340ff.r2.dev https://api.mapbox.com https://events.mapbox.com https://upload.wikimedia.org https://lh3.googleusercontent.com",
    "connect-src 'self' https://api.mapbox.com https://events.mapbox.com https://pub-20ea17ad5d694dbc94202efa1ea340ff.r2.dev https://*.r2.cloudflarestorage.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    // Tailwind/Next injetam <style> inline — manter unsafe-inline só para style
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    scriptSrc,
    "worker-src 'self' blob:",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
  ].join("; ");
}

export function proxy(req: NextRequest): NextResponse {
  const nonce = Buffer.from(randomUUID()).toString("base64");

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);

  const hasSession =
    req.cookies.has("better-auth.session_token") ||
    req.cookies.has("__Secure-better-auth.session_token");

  let res: NextResponse;
  if (!hasSession) {
    if (req.nextUrl.pathname.startsWith("/demo") || req.nextUrl.pathname === "/login") {
      res = NextResponse.next({ request: { headers: requestHeaders } });
    } else {
      res = NextResponse.redirect(new URL("/login", req.url));
    }
  } else {
    res = NextResponse.next({ request: { headers: requestHeaders } });
  }

  res.headers.set("Content-Security-Policy", buildCsp(nonce));
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|manifest\\.webmanifest|sw\\.js|workbox-.*|worker-.*|icons/.*|login|demo|register|api/auth|[^/]*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)).*)",
  ],
};
