import { headers } from "next/headers";
import { errors } from "../shared/errors";

/**
 * Auth contract for our API layer.
 *
 * This repo uses Better Auth routes, but we don't depend on its internal types here.
 * Instead, we accept a stable header-based contract:
 * - `x-auth-sub`: globally unique auth subject (maps to User.authSubject)
 * - `x-auth-role`: optional role hint (still validated against DB)
 *
 * In production, you'd typically mint/verify a signed token and derive this on the server.
 * For now, we keep it explicit and DB-backed.
 */
export type Principal = {
  authSubject: string;
};

export async function requirePrincipal(): Promise<Principal> {
  const h = await headers();
  const authSubject = h.get("x-auth-sub");
  if (!authSubject) throw errors.unauthorized();
  return { authSubject };
}
