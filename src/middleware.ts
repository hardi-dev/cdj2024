// middleware.ts
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req: request, res });

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  // If there's no session and trying to access protected routes
  if (!session && request.nextUrl.pathname.startsWith("/dashboard")) {
    // Redirect to login page
    const redirectUrl = new URL("/login", request.url);
    // Add ?redirect parameter so we can redirect back after login
    redirectUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // If there's a session but trying to access auth pages (login/register)
  if (
    session &&
    (request.nextUrl.pathname.startsWith("/login") ||
      request.nextUrl.pathname.startsWith("/register"))
  ) {
    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // If accessing admin routes, verify admin role
  if (request.nextUrl.pathname.startsWith("/dashboard/admin")) {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("auth_id", session?.user?.id)
      .single();

    if (userError || userData?.role !== "ADMIN") {
      // Redirect non-admin users to their appropriate dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return res;
}

// Specify which routes should be handled by the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
