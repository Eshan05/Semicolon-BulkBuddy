"use client";

import { createAuthClient } from "better-auth/client";
import { passkeyClient } from "@better-auth/passkey/client";
import { twoFactorClient, adminClient, multiSessionClient } from "better-auth/client/plugins";

/**
 * Client-side Better Auth client used by existing auth pages.
 *
 * Notes:
 * - This intentionally avoids any backend business logic.
 * - It only talks to the Better Auth routes (handled by `app/api/[...all]/route.ts`).
 */
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_AUTH_BASE_URL,
  plugins: [
    passkeyClient(),
    twoFactorClient(),
    adminClient(),
    multiSessionClient(),
  ],
});

// Compatibility re-exports used across the UI.
// Many components expect `signIn.*` / `signUp.*` / `signOut()` helpers.
// Better Auth client exposes these namespaces on the client instance.
export const signIn = authClient.signIn;
export const signUp = authClient.signUp;
export const signOut = authClient.signOut;
