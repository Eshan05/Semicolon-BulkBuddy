import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, BarChart3, Box, Truck, Users } from "lucide-react";

export default function SupplierDashboard() {
  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Supplier Portal</h1>
          <p className="text-muted-foreground">Manage your bids and incoming bulk orders.</p>
        </div>
        <Button variant="outline">
          Export Reports
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bids</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              4 ending today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Box className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              Awaiting confirmation
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logistics Queue</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Pickups scheduled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">450t</div>
            <p className="text-xs text-muted-foreground">
              +12% vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Open Pool Requests</CardTitle>
            <CardDescription>
              High-volume pools currently accepting supplier bids.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "Structural Steel H-Beams", region: "North-West Hub", quantity: "250 Tons", bidStatus: "Open" },
                { name: "HDPE Granules", region: "Central Ind. Park", quantity: "120 Tons", bidStatus: "Leading" },
                { name: "Copper Wire 2mm", region: "South Tech Zone", quantity: "50 Tons", bidStatus: "Outbid" },
                { name: "Industrial Lubricants", region: "East Coast", quantity: "5000 Liters", bidStatus: "Open" },
              ].map((pool, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{pool.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{pool.region}</span>
                        <span>•</span>
                        <span>{pool.quantity}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <Badge variant={
                         pool.bidStatus === "Leading" ? "default" :
                         pool.bidStatus === "Outbid" ? "destructive" : "secondary"
                     }>
                        {pool.bidStatus}
                     </Badge>
                     <Button size="sm" variant="outline">Place Bid</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Pickups</CardTitle>
            <CardDescription>
              Scheduled logistics movements for confirmed orders.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {[
                   { id: "ORD-9921", item: "Steel Sheets", time: "Tomorrow, 09:00 AM", status: "Ready" },
                   { id: "ORD-9924", item: "Aluminum Ingots", time: "Jan 18, 02:00 PM", status: "Preparing" },
                   { id: "ORD-9928", item: "Resin Bags", time: "Jan 19, 10:00 AM", status: "Pending" },
               ].map((item, i) => (
                   <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                       <div className="space-y-1">
                           <p className="text-sm font-medium">{item.id}</p>
                           <p className="text-xs text-muted-foreground">{item.item}</p>
                       </div>
                       <div className="text-right">
                           <p className="text-xs font-medium">{item.time}</p>
                           <span className="text-[10px] text-muted-foreground">{item.status}</span>
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
