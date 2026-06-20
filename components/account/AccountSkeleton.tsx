import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function SettingsSectionSkeleton() {
  return (
    <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start gap-3">
          <Skeleton className="size-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3.5 w-full max-w-[240px]" />
          </div>
        </div>
        <div className="space-y-2 rounded-xl bg-[var(--surface-2)] p-2">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-14 w-full rounded-xl" />
        </div>
      </CardContent>
    </Card>
  );
}

export function AccountSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0 overflow-hidden rounded-2xl border-0 py-0 ring-0">
        <CardContent className="relative min-h-[148px] p-5">
          <Skeleton className="absolute -right-6 -top-6 size-[7rem] rounded-full opacity-20" />
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-2 h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-full max-w-[280px]" />
          <Skeleton className="mt-4 h-7 w-24 rounded-full" />
        </CardContent>
      </Card>

      <SettingsSectionSkeleton />
      <SettingsSectionSkeleton />
      <SettingsSectionSkeleton />
      <SettingsSectionSkeleton />
      <SettingsSectionSkeleton />
      <Skeleton className="h-12 w-full rounded-2xl" />
    </div>
  );
}
