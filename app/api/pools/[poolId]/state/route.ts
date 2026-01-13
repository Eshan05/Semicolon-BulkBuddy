import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { getPoolLiveState } from "@/lib/pools";

export async function GET(
  _req: Request,
  context: { params: Promise<{ poolId: string }> },
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { poolId } = await context.params;

  const pool = await getPoolLiveState(poolId);
  if (!pool) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ pool });
}
