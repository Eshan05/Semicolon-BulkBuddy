import { betterAuth } from "better-auth";
import {
  bearer,
  admin,
  multiSession,
  organization,
  twoFactor,
  openAPI,
  deviceAuthorization,
  lastLoginMethod,
} from "better-auth/plugins"
import { passkey } from "@better-auth/passkey";;
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { reactInvitationEmail } from "./email/invitation";
import { reactResetPasswordEmail } from "./email/reset-password";
import { resend } from "./email/resend";
import { baseURL, cookieDomain } from "../utils/constants";
import { db } from "./db";
import * as schema from "./db/schema";

const from = process.env.BETTER_AUTH_EMAIL || "delivered@resend.dev";
const to = process.env.TEST_EMAIL || "";

export const auth = betterAuth({
  appName: "Better Auth Demo",
  baseURL: process.env.BETTER_AUTH_URL || baseURL || "http://localhost:3000",
  database: drizzleAdapter(db, {
    provider: "sqlite",
    schema,
  }),
  session: {
    cookieCache: {
      enabled: false, // Too big session data so no caching
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  emailAndPassword: {
    enabled: true,
    async sendResetPassword({ user, url }) {
      await resend.emails.send({
        from,
        to: user.email,
        subject: "Reset your password",
        react: reactResetPasswordEmail({
          username: user.email,
          resetLink: url,
        }),
      });
    },
  },
  emailVerification: {
    async sendVerificationEmail({ user, url }) {
      const res = await resend.emails.send({
        from,
        to: to || user.email,
        subject: "Verify your email address",
        html: `<a href="${url}">Verify your email address</a>`,
      });
      console.log(res, user.email);
    },
  },
  // account: {
  // 	accountLinking: {
  // 		trustedProviders: ["google"],
  // 	},
  // },
  socialProviders: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins: [
    organization({
      async sendInvitationEmail(data: {
        id: string;
        email: string;
        organization: { name: string };
        inviter: { user: { name: string; email: string } };
      }) {
        await resend.emails.send({
          from,
          to: data.email,
          subject: "You've been invited to join an organization",
          react: reactInvitationEmail({
            username: data.email,
            invitedByUsername: data.inviter.user.name,
            invitedByEmail: data.inviter.user.email,
            teamName: data.organization.name,
            inviteLink:
              process.env.NODE_ENV === "development"
                ? `http://localhost:3000/accept-invitation/${data.id}`
                : `${process.env.BETTER_AUTH_URL ||
                "https://demo.better-auth.com"
                }/accept-invitation/${data.id}`,
          }),
        });
      },
    }),
    // 
    twoFactor({
      otpOptions: {
        async sendOTP({ user, otp }) {
          await resend.emails.send({
            from,
            to: user.email,
            subject: "Your OTP",
            html: `Your OTP is ${otp}`,
          });
        },
      },
    }),
    passkey(),
    openAPI(),
    bearer(),
    admin({
      adminUserIds: ["EXD5zjob2SD6CBWcEQ6OpLRHcyoUbnaB"],
    }),
    multiSession(),
    nextCookies(),
    deviceAuthorization({
      expiresIn: "3min",
      interval: "5s",
    }),
    lastLoginMethod(),
  ],
  trustedOrigins: [
    "exp://",
    "http://localhost:3000",
    "http://192.168.1.*:3000",
    process.env.NEXT_PUBLIC_BETTER_AUTH_BASE,
    process.env.BETTER_AUTH_URL,
    "https://pht.esn.qzz.io",
    "https://pht-proto.vercel.app",
    baseURL,
  ].filter(Boolean) as string[],
  advanced: {
    crossSubDomainCookies: {
      enabled: process.env.NODE_ENV === "production",
      domain: cookieDomain,
    },
  },
});