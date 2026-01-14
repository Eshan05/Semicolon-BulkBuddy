import { Skeleton } from "@/components/ui/skeleton";

const ROW_KEYS = [
  "users-row-1",
  "users-row-2",
  "users-row-3",
  "users-row-4",
  "users-row-5",
];

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-44" />
      </div>

      <div className="rounded-xl border p-4 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-72" />
        <div className="space-y-3 pt-2">
          {ROW_KEYS.map((key) => (
            <Skeleton key={key} className="h-28 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
