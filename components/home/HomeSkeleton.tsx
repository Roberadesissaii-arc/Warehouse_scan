import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function StatCardSkeleton() {
  return (
    <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
      <CardContent className="p-5">
        <Skeleton className="mb-3 size-9 rounded-xl" />
        <Skeleton className="h-8 w-10" />
        <Skeleton className="mt-1.5 h-3 w-[5.5rem]" />
      </CardContent>
    </Card>
  );
}

function ChartBarsSkeleton() {
  return (
    <div className="flex min-h-[180px] items-end justify-center gap-8 px-4 pb-6 pt-8">
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-3 w-12 rounded-full" />
        <Skeleton className="h-10 w-12 rounded-t-[10px]" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-3 w-12 rounded-full" />
        <Skeleton className="h-24 w-12 rounded-t-[10px]" />
      </div>
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-3 w-10 rounded-full" />
        <Skeleton className="h-16 w-12 rounded-t-[10px]" />
      </div>
    </div>
  );
}

function QuickActionCardSkeleton() {
  return (
    <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
      <CardContent className="flex items-center gap-3.5 p-5">
        <Skeleton className="size-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
        <Skeleton className="size-[18px] shrink-0 rounded-sm" />
      </CardContent>
    </Card>
  );
}

function BannerCardSkeleton({ minHeight }: { minHeight: string }) {
  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
      <CardContent className={`relative overflow-hidden px-5 py-6 ${minHeight}`}>
        <Skeleton className="absolute -right-7 -top-7 size-[7.5rem] rounded-full" />
        <div className="relative space-y-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-2.5 w-full rounded-full" />
          <Skeleton className="h-4 w-full max-w-[260px]" />
        </div>
      </CardContent>
    </Card>
  );
}

export function HomeSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy aria-label="Loading home">
      <Card className="gap-0 overflow-hidden rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
        <CardContent className="relative min-h-[168px] overflow-hidden px-5 py-7">
          <Skeleton className="absolute -right-7 -top-7 size-[7.5rem] rounded-full" />
          <div className="relative max-w-[85%] space-y-2.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-8 w-44" />
            <Skeleton className="h-4 w-full max-w-[280px]" />
            <Skeleton className="h-4 w-full max-w-[240px]" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
        <CardContent className="p-5">
          <div className="mb-4 space-y-2">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-3.5 w-36" />
          </div>
          <ChartBarsSkeleton />
        </CardContent>
      </Card>

      <BannerCardSkeleton minHeight="min-h-[148px]" />

      <section>
        <Skeleton className="mb-3 h-3.5 w-28" />
        <div className="flex flex-col gap-3">
          <QuickActionCardSkeleton />
          <QuickActionCardSkeleton />
          <QuickActionCardSkeleton />
        </div>
      </section>

      <BannerCardSkeleton minHeight="min-h-[108px]" />
    </div>
  );
}
