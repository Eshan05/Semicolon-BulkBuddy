import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, Box, DollarSign, Package, TrendingDown } from "lucide-react";

export default function BuyerDashboard() {
  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your procurement overview.</p>
        </div>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Join New Pool
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,450</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Pools</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              2 filling, 1 locked
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Delivery est. 2 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Unit Price</CardTitle>
            <TrendingDown className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4.20</div>
            <p className="text-xs text-muted-foreground">
              -15% vs retail index
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Active Pools</CardTitle>
            <CardDescription>
              Real-time status of the pools you have joined.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "Steel Sheets 304 - Q3 Batch", status: "Filling", progress: 75, deadline: "2 days left" },
                { name: "Industrial Resin - Grade A", status: "Locked", progress: 100, deadline: "Processing" },
                { name: "Aluminum Extrusions", status: "Filling", progress: 45, deadline: "5 days left" },
              ].map((pool, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{pool.name}</p>
                    <div className="flex items-center gap-2">
                         <Badge variant={pool.status === "Locked" ? "default" : "secondary"}>{pool.status}</Badge>
                         <span className="text-xs text-muted-foreground">{pool.deadline}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="hidden w-32 flex-col items-end gap-1 sm:flex">
                        <span className="text-xs font-medium">{pool.progress}% Filled</span>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                           <div className="h-full bg-primary" style={{ width: `${pool.progress}%` }} />
                        </div>
                     </div>
                     <Button size="icon" variant="ghost">
                        <ArrowUpRight className="h-4 w-4" />
                     </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates on your orders and pools.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
               {[
                   { text: "Order #4023 shipped from Regional Hub", time: "2h ago", dot: "bg-emerald-500" },
                   { text: "Pool 'Steel Sheets' reached 75% capacity", time: "5h ago", dot: "bg-blue-500" },
                   { text: "New invoice available for Order #3992", time: "1d ago", dot: "bg-orange-500" },
                   { text: "Welcome to BulkBuddy!", time: "2d ago", dot: "bg-primary" },
               ].map((item, i) => (
                   <div key={i} className="flex items-start gap-3">
                       <span className={`mt-2 h-2 w-2 rounded-full ${item.dot}`} />
                       <div className="space-y-1">
                           <p className="text-sm font-medium leading-none">{item.text}</p>
                           <p className="text-xs text-muted-foreground">{item.time}</p>
                       </div>
                   </div>
               ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  )
}
