// middleware.js
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const TOKEN = "token";
const PASS = process.env.AUTH_PASS;

async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN)?.value;
  const value = atob(token || "");

  return value === `${PASS}:${PASS}`;
}

export async function middleware(request: NextRequest) {
  const isAuthUser = await isAuthenticated();
  const pathname = request.nextUrl.pathname;

  if (!isAuthUser) {
    if (pathname.includes("auth")) return NextResponse.next();
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth"],
};
