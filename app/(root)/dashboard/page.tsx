import { BuyerDashboardClient } from "@/components/features/pools/buyer-dashboard";
import { getBuyerDashboardData } from "@/lib/pools";

export default async function BuyerDashboard({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string }>;
}) {
  const { scope } = await searchParams;
  const data = await getBuyerDashboardData(scope);
  return <BuyerDashboardClient {...data} />;
}
