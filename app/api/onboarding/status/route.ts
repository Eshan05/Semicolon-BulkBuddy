import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { companyProfile } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({
      status: "unauthenticated",
      completed: false,
    });
  }

  const existing = await db.query.companyProfile.findFirst({
    where: eq(companyProfile.userId, session.user.id),
  });

  if (!existing) {
    return NextResponse.json({
      status: "not_started",
      completed: false,
    });
  }

  return NextResponse.json({
    status: existing.status,
    completed: existing.status === "approved",
    companyType: existing.companyType,
  });
}
