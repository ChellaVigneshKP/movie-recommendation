import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("authToken"); // Get authentication token

  // Protected routes
  const protectedRoutes = ["/dashboard", "/profile", "/settings"];

  if (protectedRoutes.includes(request.nextUrl.pathname)) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }
  
  return NextResponse.next();
}

// Apply middleware only to certain paths
export const config = {
  matcher: ["/dashboard", "/profile", "/settings"],
};