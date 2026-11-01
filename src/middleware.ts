import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

if (!process.env.SESSION_SECRET) {
  throw new Error("SESSION_SECRET is not set. Add it to your .env file.");
}
const SECRET = new TextEncoder().encode(process.env.SESSION_SECRET);

const protectedRoutes = ["/mijn-account", "/admin"];
const authRoutes = ["/inloggen", "/registreren"];
const adminRoutes = ["/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("embassy_session")?.value;

  let user = null;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET);
      user = payload.user as { role: string } | null;
    } catch {
      user = null;
    }
  }

  // Redirect logged-in users away from auth pages
  if (authRoutes.some((r) => pathname.startsWith(r)) && user) {
    const role = user.role;
    if (role === "STAFF" || role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.redirect(new URL("/mijn-account", request.url));
  }

  // Redirect unauthenticated from protected routes
  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !user) {
    return NextResponse.redirect(new URL("/inloggen", request.url));
  }

  // Block citizens from admin routes
  if (adminRoutes.some((r) => pathname.startsWith(r)) && user) {
    if (user.role === "CITIZEN") {
      return NextResponse.redirect(new URL("/mijn-account", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/mijn-account/:path*", "/admin/:path*", "/inloggen", "/registreren"],
};
