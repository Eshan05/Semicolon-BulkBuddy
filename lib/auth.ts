import { betterAuth } from "better-auth";

/**
 * Server-side Better Auth instance.
 *
 * This project already exposes Better Auth endpoints via `app/api/[...all]/route.ts`.
 * We keep auth composition here so the rest of the system (RBAC, auditing, API guards)
 * can depend on a single exported contract.
 */
export const auth = betterAuth({
  /**
   * `secret` is mandatory in production.
   * Generate once and store securely (do NOT commit).
   */
  secret: process.env.AUTH_SECRET,

  /**
   * In Next.js Route Handlers we don't rely on a hardcoded base URL.
   * Better Auth can infer from incoming requests, but `BASE_URL` helps in prod.
   */
  baseURL: process.env.AUTH_BASE_URL,

  /**
   * Minimal config to keep current auth UI working.
   * Add providers/adapters as you harden the system (DB adapter, Google, etc.).
   */
});
