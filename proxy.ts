// import { NextRequest, NextResponse } from "next/server";

// const privateRoutes = ["/profile", "/notes"];
// const publicRoutes = ["/sign-in", "/sign-up"];

// export async function proxy(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   const isPrivateRoute = privateRoutes.some((route) =>
//     pathname.startsWith(route),
//   );

//   const isPublicRoute = publicRoutes.some((route) =>
//     pathname.startsWith(route),
//   );

//   const accessToken = request.cookies.get("accessToken")?.value;
//   const refreshToken = request.cookies.get("refreshToken")?.value;

//   let isAuthenticated = !!accessToken;

//   const response = NextResponse.next();

//   if (!accessToken && refreshToken) {
//     try {
//       const refreshRes = await fetch(
//         `${request.nextUrl.origin}/api/auth/refresh`,
//         {
//           method: "POST",
//           headers: {
//             cookie: request.headers.get("cookie") ?? "",
//           },
//         },
//       );

//       if (refreshRes.ok) {
//         const data = await refreshRes.json().catch(() => null);

//         if (data?.accessToken) {
//           response.cookies.set("accessToken", data.accessToken, {
//             httpOnly: true,
//             path: "/",
//           });

//           isAuthenticated = true;
//         }
//       }
//     } catch {
//       isAuthenticated = false;
//     }
//   }

//   // 🔐 PRIVATE ROUTES
//   if (isPrivateRoute && !isAuthenticated) {
//     return NextResponse.redirect(new URL("/sign-in", request.url));
//   }

//   // 🔓 PUBLIC ROUTES
//   if (isPublicRoute && isAuthenticated) {
//     return NextResponse.redirect(new URL("/", request.url));
//   }

//   return response;
// }

// export const config = {
//   matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
// };

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { parse } from "cookie";
import { checkSession } from "@/lib/api/serverApi";

const privateRoutes = ["/profile", "/notes"];
const publicRoutes = ["/sign-in", "/sign-up"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const cookieStore = await cookies();

  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;

  const isPrivateRoute = privateRoutes.some((route) =>
    pathname.startsWith(route),
  );

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route),
  );

  // accessToken відсутній
  if (!accessToken) {
    // але є refreshToken → пробуємо відновити сесію
    if (refreshToken) {
      try {
        const data = await checkSession();

        const setCookie = data.headers["set-cookie"];

        if (setCookie) {
          const cookieArray = Array.isArray(setCookie)
            ? setCookie
            : [setCookie];

          for (const cookieStr of cookieArray) {
            const parsed = parse(cookieStr);

            const options = {
              expires: parsed.Expires ? new Date(parsed.Expires) : undefined,
              path: parsed.Path,
              maxAge: Number(parsed["Max-Age"]),
            };

            if (parsed.accessToken) {
              cookieStore.set("accessToken", parsed.accessToken, options);
            }

            if (parsed.refreshToken) {
              cookieStore.set("refreshToken", parsed.refreshToken, options);
            }
          }

          if (isPublicRoute) {
            return NextResponse.redirect(new URL("/", request.url), {
              headers: {
                Cookie: cookieStore.toString(),
              },
            });
          }

          if (isPrivateRoute) {
            return NextResponse.next({
              headers: {
                Cookie: cookieStore.toString(),
              },
            });
          }
        }
      } catch {}
    }

    if (isPublicRoute) {
      return NextResponse.next();
    }

    if (isPrivateRoute) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  if (isPublicRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (isPrivateRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*", "/notes/:path*", "/sign-in", "/sign-up"],
};
