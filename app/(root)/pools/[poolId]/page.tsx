import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getPoolDetails } from "@/lib/pools";
import { PoolRoom } from "@/components/features/pools/pool-room";

export default async function PoolDetailsPage({ params }: { params: { poolId: string } }) {
  const pool = await getPoolDetails(params.poolId);
  if (!pool) notFound();

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) notFound();

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <PoolRoom initialPool={pool} me={{ id: session.user.id, role: session.user.role ?? null }} />
    </div>
  );
}
