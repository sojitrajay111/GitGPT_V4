import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  // Define truly public paths that are accessible to everyone (logged in or not).
  // These are typically login, signup, and the root/landing page.
  const corePublicPaths = ["/", "/login", "/signup"];

  // Define paths that are part of the authentication/invitation flow
  // and should be accessible even if a token exists, but not necessarily redirect away.
  const authFlowPaths = ["/reset-password"]; // The page where password is set

  // Determine if the current path is a core public path
  const isCorePublicPath = corePublicPaths.includes(path);

  // Determine if the current path is part of the auth flow that allows token presence
  const isAuthFlowPath = authFlowPaths.includes(path);

  const token = request.cookies.get("token")?.value || "";

  console.log("Middleware Path:", path);
  console.log("Middleware Token:", token ? "Exists" : "Does not exist");
  console.log(
    "Middleware JWT_SECRET (first 5 chars):",
    process.env.JWT_SECRET
      ? process.env.JWT_SECRET.substring(0, 5)
      : "Undefined"
  );

  // Helper function to create a redirect response and ensure the token cookie is cleared
  const createRedirectAndClearCookie = (url) => {
    const response = NextResponse.redirect(new URL(url, request.nextUrl));
    response.cookies.set("token", "", {
      httpOnly: true,
      expires: new Date(0), // Set to a date in the past to expire immediately
      path: "/", // Crucial: ensure path matches the cookie's path
      secure: process.env.NODE_ENV === "production", // Match cookie's secure setting
      sameSite: "lax", // Match cookie's sameSite setting
    });
    console.log(`Attempted to clear cookie and redirect to ${url}`);
    return response;
  };

  // Rule 1: If NO token and trying to access a PROTECTED path, redirect to login (root).
  // A path is protected if it's neither a core public path nor an auth flow path.
  if (!token && !isCorePublicPath && !isAuthFlowPath) {
    console.log("Redirecting unauthenticated user to / from protected path.");
    return createRedirectAndClearCookie("/");
  }

  // Rule 2: If a token EXISTS, verify it.
  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      console.log("Token verified, payload:", payload);

      // Rule 3 (Modified): If token is valid AND user is trying to access a CORE PUBLIC path,
      // redirect them to the login page ('/') AND explicitly clear the cookie.
      // This is the direct implementation of "even token exist to browser user goes to login page".
      // We explicitly exclude authFlowPaths here because we want them to be accessible
      // even if a token exists (e.g., during the password reset after invitation).
      if (isCorePublicPath && !isAuthFlowPath) {
        console.log(
          "Redirecting logged-in user from core public path to / (login) and clearing cookie."
        );
        return createRedirectAndClearCookie("/"); // Use the helper to clear and redirect
      }

      // If token is valid and the path is NOT a core public path, AND NOT an auth flow path,
      // it's a protected path, allow access.
      // If it's an authFlowPath (like /reset-password), also allow access.
    } catch (error) {
      console.error("Token verification failed in middleware:", error.message);
      // Rule 4: If token verification fails (expired, invalid, etc.),
      // clear the invalid token cookie and redirect to the login page ('/').
      return createRedirectAndClearCookie("/"); // Use the helper to clear and redirect
    }
  }

  // Final Rule: If no redirect conditions are met, allow the request to proceed.
  // This covers cases where:
  // - A valid token exists and the path is a protected (non-public, non-core-public) route.
  // - No token exists, but the path is a core public route or an auth flow route.
  console.log("Allowing access to:", path);
  return NextResponse.next();
}

export const config = {
  // Apply middleware to all paths except static files and images.
  // This ensures the middleware runs for all page routes and relevant API routes.
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)",
    "/api/user-management/:path*",
  ],
};
