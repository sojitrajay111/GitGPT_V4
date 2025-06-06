import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
  const path = request.nextUrl.pathname;
  const publicPaths = ["/", "/login", "/signup"];
  const isPublicPath = publicPaths.includes(path);
  const token = request.cookies.get("token")?.value || "";

  console.log('Middleware Path:', path); // Add this
  console.log('Middleware Token:', token ? 'Exists' : 'Does not exist'); // Add this
  console.log('Middleware JWT_SECRET (first 5 chars):', process.env.JWT_SECRET ? process.env.JWT_SECRET.substring(0,5) : 'Undefined'); // Add this for debugging

  if (!isPublicPath && !token) {
    console.log('Redirecting to / because no token on protected path');
    return NextResponse.redirect(new URL("/", request.nextUrl));
  }

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      console.log('Token verified, payload:', payload); // Add this

      if (isPublicPath) {
        const userId = payload.id;
        console.log('Redirecting public path user to dashboard:', `/${userId}/dashboard`);
        return NextResponse.redirect(
          new URL(`/${userId}/dashboard`, request.nextUrl)
        );
      }
    } catch (error) {
      console.error("Token verification failed in middleware:", error.message);
      const response = NextResponse.redirect(new URL("/", request.nextUrl));
      response.cookies.set("token", "", {
        httpOnly: true,
        expires: new Date(0),
      });
      return response;
    }
  }

  console.log('Allowing access to:', path);
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)"],
};
