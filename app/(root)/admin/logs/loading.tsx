import { Skeleton } from "@/components/ui/skeleton";

const ROW_KEYS = [
  "log-row-1",
  "log-row-2",
  "log-row-3",
  "log-row-4",
  "log-row-5",
  "log-row-6",
  "log-row-7",
  "log-row-8",
];

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-44" />
      </div>

      <div className="rounded-xl border p-4 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-56" />
        <div className="space-y-2 pt-2">
          {ROW_KEYS.map((key) => (
            <Skeleton key={key} className="h-16 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
