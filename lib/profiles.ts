'use server'

import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { companyProfile } from "@/lib/db/schema";

async function getAuthedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function getCompanyByUserId(userId: string) {
  const authedUser = await getAuthedUser();
  if (!authedUser) return null;

  return db.query.companyProfile.findFirst({
    where: eq(companyProfile.userId, userId),
    with: {
      buyerProfile: true,
      supplierProfile: true,
      documents: true,
      user: true,
    },
  });
}
