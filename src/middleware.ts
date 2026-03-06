import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "open-dash-session";

// Routes that require authentication (page routes)
const PROTECTED_PAGES = ["/builder", "/dashboard", "/admin"];

// API route prefixes that require authentication
const PROTECTED_API_PREFIXES = [
  "/api/sidebar",
  "/api/header-components",
  "/api/pages",
  "/api/config",
  "/api/ai",
  "/api/projects",
  "/api/builder/layouts",
  "/api/admin",
  "/api/logs",
  "/api/fix-css",
  "/api/fix-notification-count",
  "/api/seed-profile-menu",
];

// Routes exempt from auth (public)
const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/auth/login",
  "/signup",
  "/forgot-password",
  "/how-to",
  "/api/auth",
  "/api/widgets",
  "/preview",
];

// Public auth-entry routes where logged-in users should go to dashboard
const AUTH_ENTRY_ROUTES = ["/", "/login", "/auth/login", "/signup"];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
}

function isProtectedPage(pathname: string): boolean {
  return PROTECTED_PAGES.some(
    (page) => pathname === page || pathname.startsWith(page + "/") || pathname.startsWith(page + "?")
  );
}

function isProtectedApiRoute(pathname: string): boolean {
  return PROTECTED_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthEntryRoute(pathname: string): boolean {
  return AUTH_ENTRY_ROUTES.some((route) => pathname === route);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`Debug flow: middleware fired with`, { pathname });

  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  const hasSession = !!sessionCookie?.value;

  console.log(`Debug flow: middleware session check`, { pathname, hasSession });

  if (isAuthEntryRoute(pathname) && hasSession) {
    const dashboardUrl = new URL("/dashboard", request.url);
    console.log(`Debug flow: middleware redirecting authenticated user from auth-entry route`, {
      pathname,
      destination: dashboardUrl.pathname,
    });
    return NextResponse.redirect(dashboardUrl);
  }

  // Skip public routes
  if (isPublicRoute(pathname)) {
    console.log(`Debug flow: middleware public route, passing through`, { pathname });
    return NextResponse.next();
  }

  // Block unauthenticated access to protected pages
  if (isProtectedPage(pathname) && !hasSession) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
    console.log(`Debug flow: middleware blocking unauthenticated page access, redirecting to login`, { pathname });
    return NextResponse.redirect(loginUrl);
  }

  // Block unauthenticated access to protected API routes
  if (isProtectedApiRoute(pathname) && !hasSession) {
    console.log(`Debug flow: middleware blocking unauthenticated API access`, { pathname });
    return NextResponse.json(
      { ok: false, error: "Unauthorized — authentication required", code: "UNAUTHENTICATED" },
      { status: 401 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|icons|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
