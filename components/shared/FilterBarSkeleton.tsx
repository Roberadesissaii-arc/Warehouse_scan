import { Skeleton } from "@/components/ui/skeleton";

export function FilterBarSkeleton() {
  return (
    <div className="filter-bar" aria-hidden>
      <div className="filter-bar-track flex gap-2">
        <Skeleton className="h-9 w-[4.5rem] shrink-0 rounded-full" />
        <Skeleton className="h-9 w-[5.5rem] shrink-0 rounded-full" />
        <Skeleton className="h-9 w-[6.5rem] shrink-0 rounded-full" />
        <Skeleton className="h-9 w-[4rem] shrink-0 rounded-full" />
      </div>
    </div>
  );
}
