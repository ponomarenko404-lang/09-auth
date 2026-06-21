import { NextRequest, NextResponse } from "next/server";

const privateRoutes = ["/profile", "/notes"];
const publicRoutes = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let isAuthenticated = !!accessToken;

  const response = NextResponse.next();

  if (!accessToken && refreshToken) {
    try {
      const refreshRes = await fetch(
        `${request.nextUrl.origin}/api/auth/refresh`,
        {
          method: "POST",
          headers: {
            cookie: request.headers.get("cookie") ?? "",
          },
        },
      );

      if (refreshRes.ok) {
        const data = await refreshRes.json().catch(() => null);

        if (data?.accessToken) {
          response.cookies.set("accessToken", data.accessToken, {
            httpOnly: true,
            path: "/",
          });

          isAuthenticated = true;
        }
      }
    } catch {
      isAuthenticated = false;
    }
  }

  // 🔐 PRIVATE ROUTES
  if (isPrivateRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 🔓 PUBLIC ROUTES
  if (isPublicRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
