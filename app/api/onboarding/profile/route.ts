import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getOnboardingProfile, getOnboardingStatus } from "@/lib/onboarding";

export async function GET() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return NextResponse.json({
      status: "unauthenticated",
      profile: null,
    });
  }

  const [status, profile] = await Promise.all([
    getOnboardingStatus(),
    getOnboardingProfile(),
  ]);

  return NextResponse.json({
    status,
    profile,
  });
}
