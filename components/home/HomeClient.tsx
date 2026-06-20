"use client";

import { Layers, LayoutList, PackageCheck, ScanLine } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { useWarehouseStatus } from "@/components/WarehouseStatusProvider";
import { Card, CardContent } from "@/components/ui/card";
import { FloorOverviewChart } from "./FloorOverviewChart";
import { HomeActiveTasksBanner } from "./HomeActiveTasksBanner";
import { HomeFleetAvailability } from "./HomeFleetAvailability";
import { HomeSkeleton } from "./HomeSkeleton";
import { QuickActionCard } from "./QuickActionCard";
import { StatCard } from "./StatCard";

export function HomeClient() {
  const { me, signedIn } = useAuth();
  const { boot, loading } = useWarehouseStatus();

  if (!signedIn) return null;
  if (loading) return <HomeSkeleton />;

  const tasks = boot?.tasks || [];
  const robots = boot?.robots || [];
  const openTasks = tasks.filter((t) => t.status === "queued" || t.status === "in_progress").length;
  const onlineRobots = robots.filter((r) => r.status !== "offline").length;
  const fleetPct = robots.length ? Math.round((onlineRobots / robots.length) * 100) : 0;
  const displayName = me?.username || "Staff";
  const firstName = displayName.split(/\s+/)[0] || displayName;

  return (
    <div className="flex flex-col gap-4">
      <Card className="gap-0 overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-[#0f766e] to-[#14b8a6] py-0 text-white shadow-[0_10px_32px_rgba(15,118,110,0.28)] ring-0">
        <CardContent className="relative min-h-[168px] overflow-hidden px-5 py-7">
          <PackageCheck
            aria-hidden
            className="pointer-events-none absolute -right-7 -top-7 size-[7.5rem] text-white/22"
            strokeWidth={1.6}
          />

          <div className="relative max-w-[85%]">
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/80">Good shift</p>
            <h2 className="font-heading mt-2 text-[26px] font-bold leading-tight tracking-tight">
              Hello, {firstName}
            </h2>
            <p className="mt-3 text-[14px] leading-relaxed text-white/92">
              Scan items, queue picks, and keep the floor moving. Everything you do here stays in sync with the
              warehouse board.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={LayoutList} value={openTasks} label="Open tasks" tone="teal" />
        <StatCard icon={Layers} value={onlineRobots} label="Robots online" tone="emerald" />
      </div>

      <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
        <CardContent className="p-5">
          <div className="mb-4">
            <h2 className="text-base font-semibold tracking-tight">Floor activity</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tasks by status today</p>
          </div>
          <FloorOverviewChart tasks={tasks} />
        </CardContent>
      </Card>

      <HomeFleetAvailability
        onlineRobots={onlineRobots}
        totalRobots={robots.length}
        fleetPct={fleetPct}
      />

      <section>
        <h3 className="mb-3 text-[13px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
          Quick actions
        </h3>
        <div className="flex flex-col gap-3">
          <QuickActionCard
            href="/scan"
            icon={ScanLine}
            title="Scan an item"
            description="Camera or manual code"
            primary
          />
          <QuickActionCard
            href="/tasks"
            icon={LayoutList}
            title="View tasks"
            description="Accept or fulfill picks"
          />
          <QuickActionCard
            href="/fleet"
            icon={Layers}
            title="Fleet status"
            description="See who is online"
          />
        </div>
      </section>

      <HomeActiveTasksBanner count={openTasks} />
    </div>
  );
}
