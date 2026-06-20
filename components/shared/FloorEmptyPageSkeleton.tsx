import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function FloorEmptyPageSkeleton({ showIntro = true }: { showIntro?: boolean }) {
  return (
    <div className="floor-empty-stack" aria-busy="true" aria-label="Loading">
      {showIntro ? (
        <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
          <CardContent className="px-3.5 py-3">
            <div className="flex items-start gap-2.5">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-3.5 w-full max-w-[280px]" />
              </div>
              <Skeleton className="mt-0.5 size-[18px] shrink-0 rounded-sm" />
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
        <CardContent className="relative flex min-h-[calc(100dvh-var(--header-chrome-h)-var(--nav-chrome-h)-148px)] flex-col items-center justify-center overflow-hidden px-6 py-10 text-center">
          <Skeleton className="pointer-events-none absolute -right-6 -top-6 size-[6.5rem] rounded-full opacity-25" />
          <div className="relative w-full max-w-[300px] space-y-2.5">
            <Skeleton className="mx-auto h-4 w-32" />
            <Skeleton className="mx-auto h-4 w-56" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
