import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

// This function can be marked `async` if using `await` inside
export async function middleware(request) {
  const path = request.nextUrl.pathname;

  // Define public paths that do not require authentication
  const publicPaths = ["/", "/login", "/signup"];
  const isPublicPath = publicPaths.includes(path);

  // Try to get the token from cookies
  const token = request.cookies.get("token")?.value || "";

  // 1. If trying to access a protected route without a token, redirect to the main login page ('/')
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  // 2. If a token exists, verify it
  if (token) {
    try {
      // Use a secret key that matches the one used for signing the token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      // If verification is successful and the user is on a public page (login/signup),
      // redirect them to their dashboard.
      if (isPublicPath) {
        const userId = payload.id; // Extract user ID from token payload
        return NextResponse.redirect(
          new URL(`/${userId}/dashboard`, request.nextUrl)
        );
      }
    } catch (error) {
      // If token verification fails (e.g., expired, invalid), clear the cookie and redirect to login
      console.error("Token verification failed:", error.message);
      const response = NextResponse.redirect(new URL("/", request.nextUrl));
      response.cookies.set("token", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      return response;
    }
  }

  // 3. Allow access if the path is public and there's no token, or if it's a protected path with a valid token.
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - logo.png (your logo file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)",
  ],
};
