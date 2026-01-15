import { notFound } from "next/navigation";
import { headers } from "next/headers";

import { auth } from "@/lib/auth";
import { getSupportContact } from "@/lib/admin";
import { getPoolDetails } from "@/lib/pools";
import { PoolRoom } from "@/components/features/pools/pool-room";

export default async function PoolDetailsPage({
  params,
}: {
  params: Promise<{ poolId: string }>;
}) {
  const { poolId } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) notFound();

  const pool = await getPoolDetails(poolId, session.user.id);
  if (!pool) notFound();

  const supportContact = await getSupportContact().catch(() => null);

  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <PoolRoom
        initialPool={pool}
        me={{ id: session.user.id, role: session.user.role ?? null }}
        supportContact={supportContact}
      />
    </div>
  );
}
