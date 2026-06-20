import { MapPin, Radio, Wifi, WifiOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Robot } from "@/lib/api";
import { robotImageUrl, unitById } from "@/lib/robotImages";

const STATUS_LABEL: Record<string, string> = {
  idle: "Idle",
  working: "Working",
  returning: "Returning",
  charging: "Charging",
  offline: "Offline",
};

const STATUS_HINT: Record<string, string> = {
  idle: "Ready on the floor",
  working: "Executing a task right now",
  returning: "Heading back to its station",
  charging: "Charging at the dock",
  offline: "Not connected to the network",
};

const STATUS_BADGE: Record<string, string> = {
  idle: "bg-emerald-50 text-emerald-800",
  working: "bg-teal-50 text-teal-800",
  returning: "bg-sky-50 text-sky-800",
  charging: "bg-amber-50 text-amber-800",
  offline: "bg-zinc-100 text-zinc-600",
};

export function RobotCard({ robot }: { robot: Robot }) {
  const online = robot.status !== "offline";
  const badgeClass = STATUS_BADGE[robot.status] || STATUS_BADGE.offline;
  const hint = STATUS_HINT[robot.status] || "Floor robot";
  const unit = unitById(robot.unit_image);
  const imgSrc = robotImageUrl(robot.unit_image);
  const modelLabel = robot.unit_brand || unit.brand;
  const modelCode = robot.unit_code || unit.code;

  return (
    <Card className="gap-0 overflow-visible rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
      <div className="robot-card-hero-wrap">
        <div className="robot-card-hero-frame">
          <div className="robot-card-hero-frame__ring" aria-hidden />
          <div className="robot-card-hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgSrc}
              alt=""
              className="h-full w-full object-cover object-center"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-heading text-[17px] font-semibold leading-tight tracking-tight text-[var(--text)]">
              {robot.name}
            </p>
            <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-[var(--text-soft)]">
              {modelLabel} · {modelCode}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className={cn("border-0 font-semibold", badgeClass)}>
                {STATUS_LABEL[robot.status] || robot.status}
              </Badge>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[11px] font-medium",
                  online ? "text-emerald-700" : "text-zinc-500",
                )}
              >
                <span
                  className={cn("size-2 rounded-full", online ? "bg-emerald-500" : "bg-zinc-400")}
                  aria-hidden
                />
                {online ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl",
              online ? "bg-teal-50 text-teal-700" : "bg-zinc-100 text-zinc-500",
            )}
            aria-label={online ? "Online" : "Offline"}
          >
            {online ? <Wifi size={20} strokeWidth={2.2} /> : <WifiOff size={20} strokeWidth={2.2} />}
          </div>
        </div>

        <div className="space-y-2.5 border-t border-[var(--border)]/60 pt-3.5">
          <p className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
            <MapPin size={15} className="shrink-0 text-[var(--text-soft)]" />
            <span className="truncate">
              {robot.warehouse_name || "Warehouse"}
              {robot.section_name ? ` · ${robot.section_name}` : ""}
            </span>
          </p>
          <p className="flex items-center gap-2 text-[13px] text-[var(--text-muted)]">
            <Radio size={15} className="shrink-0 text-[var(--text-soft)]" />
            <span>Unit #{robot.id}</span>
            <span className="text-[var(--text-soft)]">·</span>
            <span>{robot.paired === false ? "Not paired" : "Paired to floor"}</span>
          </p>
          <p className="text-[12px] leading-snug text-[var(--text-soft)]">{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function RobotCardSkeleton() {
  return (
    <Card className="gap-0 overflow-visible rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.06)] ring-0">
      <div className="robot-card-hero-wrap">
        <div className="robot-card-hero-frame">
          <div className="robot-card-hero-frame__ring" aria-hidden />
          <div className="robot-card-hero animate-pulse bg-[var(--surface-2)]" />
        </div>
      </div>
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
