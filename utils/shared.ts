import type { ReadonlyURLSearchParams } from "next/navigation";

/**
 * Central place for small shared helpers used by auth flows.
 *
 * Contract:
 * - Input: Next.js search params
 * - Output: a safe relative callback path
 */
export function getCallbackURL(params?: ReadonlyURLSearchParams | null): string {
  const raw = params?.get("callbackUrl") ?? params?.get("callbackURL") ?? "/";

  // Only allow relative redirects to avoid open-redirect vulnerabilities.
  if (!raw.startsWith("/")) return "/";
  if (raw.startsWith("//")) return "/";

  return raw;
}
