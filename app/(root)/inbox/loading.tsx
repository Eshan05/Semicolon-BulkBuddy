import { Skeleton } from "@/components/ui/skeleton";

const ROW_KEYS = [
  "inbox-row-1",
  "inbox-row-2",
  "inbox-row-3",
  "inbox-row-4",
  "inbox-row-5",
  "inbox-row-6",
];

export default function Loading() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="rounded-xl border p-4 space-y-3">
        <Skeleton className="h-5 w-44" />
        <Skeleton className="h-4 w-64" />
        <div className="space-y-2 pt-2">
          {ROW_KEYS.map((key) => (
            <Skeleton key={key} className="h-12 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
