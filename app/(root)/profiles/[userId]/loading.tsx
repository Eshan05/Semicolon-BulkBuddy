import { Skeleton } from "@/components/ui/skeleton";

const METRIC_KEYS = [
  "metric-1",
  "metric-2",
  "metric-3",
  "metric-4",
  "metric-5",
  "metric-6",
];

const DETAIL_KEYS = [
  "detail-1",
  "detail-2",
  "detail-3",
  "detail-4",
  "detail-5",
  "detail-6",
  "detail-7",
  "detail-8",
];

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-80" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      <div className="rounded-xl border p-4 space-y-3">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-72" />
        <div className="grid gap-3 md:grid-cols-3">
          {METRIC_KEYS.map((key) => (
            <Skeleton key={key} className="h-20 w-full" />
          ))}
        </div>
      </div>

      <div className="rounded-xl border p-4 space-y-3">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-72" />
        <div className="grid gap-3 md:grid-cols-2">
          {DETAIL_KEYS.map((key) => (
            <Skeleton key={key} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
