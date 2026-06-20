import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function FloorEmptyPanel({
  icon: Icon,
  title,
  description,
  compact,
  fill,
  stretch,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  compact?: boolean;
  /** Stretch to fill the empty page (Tasks / Fleet with no data). */
  fill?: boolean;
  /** Grow to fill space below a filter bar. */
  stretch?: boolean;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0",
        stretch && "floor-empty-panel--stretch",
        className,
      )}
    >
      <CardContent
        className={cn(
          "relative flex flex-col items-center justify-center overflow-hidden px-6 text-center",
          stretch
            ? "py-10"
            : compact
              ? "min-h-[200px] py-7"
              : fill
                ? "min-h-[calc(100dvh-var(--header-chrome-h)-var(--nav-chrome-h)-148px)] py-10"
                : "min-h-[240px] py-10",
        )}
      >
        <Icon
          aria-hidden
          className={cn(
            "pointer-events-none absolute text-[#e8eceb]",
            compact ? "-right-5 -top-5 size-[5.5rem]" : "-right-6 -top-6 size-[6.5rem]",
          )}
          strokeWidth={1.5}
        />

        <div className="relative max-w-[300px]">
          <p className="inline-flex items-center justify-center gap-2 text-[14px] font-medium leading-relaxed text-[var(--text-muted)]">
            <Icon size={17} strokeWidth={2.2} className="shrink-0 text-[#0f766e]" aria-hidden />
            {title}
          </p>
          <p className="mt-2 text-[14px] font-medium leading-relaxed text-[var(--text-muted)]">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
