"use client";

import { createAuthClient } from "better-auth/client";

/**
 * Client-side Better Auth client used by existing auth pages.
 *
 * Notes:
 * - This intentionally avoids any backend business logic.
 * - It only talks to the Better Auth routes (handled by `app/api/[...all]/route.ts`).
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_BASE_URL,
});
