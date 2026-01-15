import { Skeleton } from "@/components/ui/skeleton";

const STAT_KEYS = ["stat-1", "stat-2", "stat-3", "stat-4"];

export default function Loading() {
  return (
    <div className="flex flex-col gap-8 p-6 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STAT_KEYS.map((key) => (
          <Skeleton key={key} className="h-24 w-full" />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="h-105 w-full lg:col-span-4" />
        <Skeleton className="h-105 w-full lg:col-span-3" />
      </div>
    </div>
  );
}
