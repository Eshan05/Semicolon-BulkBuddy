import { BuyerDashboardClient } from "@/components/features/pools/buyer-dashboard";
import { getBuyerDashboardData } from "@/lib/pools";

export default async function BuyerDashboard() {
  const data = await getBuyerDashboardData();
  return <BuyerDashboardClient {...data} />;
}
