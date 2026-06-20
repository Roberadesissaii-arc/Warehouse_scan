import Link from "next/link";
import { Hash, Layers, LayoutList, MapPin, PackageCheck, ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  queued: "Queued",
  in_progress: "In progress",
  done: "Done",
  cancelled: "Cancelled",
};

const STATUS_HINT: Record<string, string> = {
  queued: "Waiting to be accepted on the floor",
  in_progress: "Pick or move is underway right now",
  done: "This task is complete",
  cancelled: "This task was cancelled",
};

const STATUS_BADGE: Record<string, string> = {
  queued: "bg-amber-50 text-amber-800",
  in_progress: "bg-teal-50 text-teal-800",
  done: "bg-emerald-50 text-emerald-800",
  cancelled: "bg-zinc-100 text-zinc-600",
};

const ACTION_LABEL: Record<string, string> = {
  pick: "Pick",
  place: "Place",
  move: "Move",
};

export function TaskCard({ task }: { task: Task }) {
  const action = ACTION_LABEL[task.action?.toLowerCase() || ""] || task.action || "Task";
  const title = task.item || task.section || "Floor task";
  const badgeClass = STATUS_BADGE[task.status] || STATUS_BADGE.queued;
  const hint = STATUS_HINT[task.status] || "Floor task";
  const isStoreOrder = Boolean(task.store_order_ref);
  const done = task.status === "done";
  const active = task.status === "in_progress";

  const iconTone = done
    ? "bg-emerald-50 text-emerald-700"
    : active
      ? "bg-teal-50 text-teal-700"
      : isStoreOrder
        ? "bg-teal-50 text-teal-700"
        : "bg-amber-50 text-amber-800";

  return (
    <Link
      href={`/tasks/${task.id}`}
      className="block rounded-2xl outline-none transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
    >
      <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
        <CardContent className="p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="font-heading text-[17px] font-semibold leading-tight tracking-tight text-[var(--text)]">
                {action}
                <span className="font-normal text-[var(--text-muted)]"> · </span>
                {title}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge className={cn("border-0 font-semibold", badgeClass)}>
                  {STATUS_LABEL[task.status] || task.status}
                </Badge>
                {isStoreOrder ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-teal-700">
                    <span className="size-2 rounded-full bg-teal-500" aria-hidden />
                    Pick request
                  </span>
                ) : null}
              </div>
            </div>
            <div
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-xl",
                iconTone,
              )}
              aria-hidden
            >
              {isStoreOrder ? (
                <PackageCheck size={20} strokeWidth={2.2} />
              ) : (
                <LayoutList size={20} strokeWidth={2.2} />
              )}
            </div>
          </div>

          <div className="space-y-2.5 border-t border-[var(--border)]/60 pt-3.5">
            <p className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
              <Hash size={15} className="shrink-0 text-[var(--text-soft)]" />
              <span>Task #{task.id}</span>
              {task.quantity && task.quantity > 1 ? (
                <>
                  <span className="text-[var(--text-soft)]">·</span>
                  <span>Qty {task.quantity}</span>
                </>
              ) : null}
            </p>
            {task.robot ? (
              <p className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
                <Layers size={15} className="shrink-0 text-[var(--text-soft)]" />
                <span className="truncate">{task.robot}</span>
              </p>
            ) : null}
            {task.section ? (
              <p className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
                <MapPin size={15} className="shrink-0 text-[var(--text-soft)]" />
                <span className="truncate">{task.section}</span>
              </p>
            ) : null}
            {isStoreOrder ? (
              <p className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
                <ShoppingBag size={15} className="shrink-0 text-[var(--text-soft)]" />
                <span>Order {task.store_order_ref}</span>
              </p>
            ) : null}
            <p className="text-[12px] leading-snug text-[var(--text-soft)]">{hint}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function TaskCardSkeleton() {
  return (
    <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.06)] ring-0">
      <CardContent className="space-y-4 p-5">
        <div className="flex justify-between gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-5 w-2/3 animate-pulse rounded-md bg-[var(--surface-2)]" />
            <div className="h-5 w-24 animate-pulse rounded-full bg-[var(--surface-2)]" />
          </div>
          <div className="size-10 animate-pulse rounded-xl bg-[var(--surface-2)]" />
        </div>
        <div className="space-y-2 border-t border-[var(--border)]/60 pt-3.5">
          <div className="h-3.5 w-full animate-pulse rounded-md bg-[var(--surface-2)]" />
          <div className="h-3.5 w-4/5 animate-pulse rounded-md bg-[var(--surface-2)]" />
          <div className="h-3 w-3/5 animate-pulse rounded-md bg-[var(--surface-2)]" />
        </div>
      </CardContent>
    </Card>
  );
}
