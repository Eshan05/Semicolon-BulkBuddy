import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/src/server/data/prisma/client";
import { twoFactor } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";

/**
 * Server-side Better Auth instance.
 */
export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  emailPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },

  plugins: [
    passkey(),
    twoFactor(),
  ],

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
});
