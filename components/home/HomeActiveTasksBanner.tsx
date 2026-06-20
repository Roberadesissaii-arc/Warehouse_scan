import Link from "next/link";
import { ChevronRight, LayoutList } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function HomeActiveTasksBanner({ count }: { count: number }) {
  const hasTasks = count > 0;

  return (
    <Link
      href="/tasks"
      className="block rounded-2xl outline-none transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
    >
      <Card className="gap-0 overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-[#0f766e] to-[#14b8a6] py-0 text-white shadow-[0_10px_32px_rgba(15,118,110,0.22)] ring-0">
        <CardContent className="relative min-h-[108px] overflow-hidden px-5 py-5">
          <LayoutList
            aria-hidden
            className="pointer-events-none absolute -right-7 -top-7 size-[7.5rem] text-white/22"
            strokeWidth={1.6}
          />

          <div className="relative flex items-center justify-between gap-3">
            <div className="min-w-0 max-w-[85%]">
              <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/80">Floor queue</p>
              <p className="font-heading mt-2 text-[22px] font-bold leading-tight tracking-tight">
                {hasTasks
                  ? `${count} active task${count === 1 ? "" : "s"} waiting`
                  : "No tasks waiting"}
              </p>
              <p className="mt-2.5 text-[14px] leading-relaxed text-white/92">
                {hasTasks
                  ? "Tap to accept picks and fulfill work on the floor."
                  : "The floor is clear — scan an item to queue a pick when you need one."}
              </p>
            </div>

            <ChevronRight className="size-5 shrink-0 text-white/80" aria-hidden />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
