import { Session } from "@/lib/auth-types";
import { betterFetch } from "@better-fetch/fetch";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { data: session } = await betterFetch<Session>("/api/auth/get-session", {
    baseURL: request.nextUrl.origin,
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
  });

  const { nextUrl } = request;
  const { pathname } = nextUrl;

  const isAdminRoute = pathname.startsWith("/admin");
  const isSupplierRoute = pathname.startsWith("/supplier");
  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isOnboardingRoute = pathname.startsWith("/onboarding");
  const protectedPrefixes = ["/admin", "/supplier", "/dashboard", "/onboarding"];
  const isTryingToAccessProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isTryingToAccessProtectedRoute) {
    return NextResponse.next();
  }

  if (!session || !session.user) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }

  const role = session.user.role;

  if (isOnboardingRoute && role !== "admin") {
    const { data: onboarding } = await betterFetch<{ status: string; completed: boolean; companyType?: string }>(
      "/api/onboarding/status",
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      },
    );

    if (onboarding?.completed) {
      if (role === "supplier") {
        return NextResponse.redirect(new URL("/supplier/dashboard", request.url));
      }
      if (role === "buyer") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  if (!isAdminRoute && !isOnboardingRoute && role !== "admin") {
    const { data: onboarding } = await betterFetch<{ status: string; completed: boolean }>(
      "/api/onboarding/status",
      {
        baseURL: request.nextUrl.origin,
        headers: {
          cookie: request.headers.get("cookie") || "",
        },
      },
    );

    if (!onboarding?.completed) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }

  // RBAC Logic
  if (isAdminRoute && role !== "admin") {
    // If authorized but wrong role, go to their specific dashboard
    if (role === "supplier") {
      return NextResponse.redirect(new URL("/supplier/dashboard", request.url));
    }
    if (role === "buyer") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (isSupplierRoute && role !== "supplier") {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  if (isDashboardRoute) {
    if (role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    if (role === "supplier") {
      return NextResponse.redirect(new URL("/supplier/dashboard", request.url));
    }
    if (role !== "buyer") {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    if (role === "buyer") {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/supplier/:path*",
    "/dashboard/:path*",
    "/onboarding/:path*",
  ],
};
