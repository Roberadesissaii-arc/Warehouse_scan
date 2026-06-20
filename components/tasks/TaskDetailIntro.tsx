import { LayoutList, PackageCheck } from "lucide-react";
import type { Task } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<string, string> = {
  queued: "Queued",
  in_progress: "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

const STATUS_BADGE: Record<string, string> = {
  queued: "border-white/25 bg-white/15 text-white",
  in_progress: "border-white/25 bg-white/15 text-white",
  done: "border-white/25 bg-white/20 text-white",
  cancelled: "border-white/20 bg-white/10 text-white/80",
};

const STATUS_HINT: Record<string, string> = {
  queued: "Waiting on the floor — accept the pick or assign it to yourself.",
  in_progress: "Pick is underway. Mark ready when items are at your spot.",
  done: "This pick is finished — nothing else to do here.",
  cancelled: "This task was cancelled on the warehouse board.",
};

export function TaskDetailIntro({ task }: { task: Task }) {
  const title = task.item || task.section || "Floor task";
  const isStoreOrder = Boolean(task.store_order_ref);
  const DecorativeIcon = isStoreOrder ? PackageCheck : LayoutList;
  const badgeClass = STATUS_BADGE[task.status] || STATUS_BADGE.queued;

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-[#0f766e] to-[#14b8a6] py-0 text-white shadow-[0_10px_32px_rgba(15,118,110,0.22)] ring-0">
      <CardContent className="relative min-h-[112px] overflow-hidden px-4 py-5">
        <DecorativeIcon
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 size-24 text-white/20"
          strokeWidth={1.6}
        />

        <div className="relative max-w-[88%]">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/80">
            {(task.action || "Task").toUpperCase()}
            {task.id ? ` · #${task.id}` : ""}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-[22px] font-bold leading-tight tracking-tight">{title}</h1>
            <Badge className={cn("border font-semibold", badgeClass)}>
              {STATUS_LABEL[task.status] || task.status}
            </Badge>
          </div>
          <p className="mt-2.5 text-[13px] leading-relaxed text-white/90">
            {STATUS_HINT[task.status] || "Floor task on your garage board."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
