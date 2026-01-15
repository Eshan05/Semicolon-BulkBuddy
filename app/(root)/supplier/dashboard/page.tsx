import { SupplierDashboardClient } from "@/components/features/pools/supplier-dashboard";
import { getSupplierDashboardData } from "@/lib/pools";

export default async function SupplierDashboard({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const { scope } = await searchParams;
  const data = await getSupplierDashboardData(scope);
  return (
    <SupplierDashboardClient
      stats={data.stats}
      suggestedPools={data.suggestedPools}
      myBids={data.myBids}
      scope={data.scope}
    />
  );
}
