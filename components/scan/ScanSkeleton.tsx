import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function ScanCardSkeleton() {
  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
      <CardContent className="p-5">
        <div className="mb-4 flex items-start gap-3">
          <Skeleton className="size-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3.5 w-full max-w-[220px]" />
          </div>
        </div>
        <Skeleton className="h-[220px] w-full rounded-2xl" />
      </CardContent>
    </Card>
  );
}

export function ScanSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0 overflow-hidden rounded-2xl border-0 py-0 ring-0">
        <CardContent className="relative min-h-[100px] px-4 py-5">
          <Skeleton className="absolute -right-6 -top-6 size-24 rounded-full opacity-20" />
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-2 h-7 w-36" />
          <Skeleton className="mt-2.5 h-3.5 w-full max-w-[260px]" />
        </CardContent>
      </Card>
      <ScanCardSkeleton />
      <ScanCardSkeleton />
    </div>
  );
}
