"use client";

import { useEffect, useMemo, useState } from "react";
import { Layers } from "lucide-react";
import { get, asList, type Robot } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { useWarehouseStatus } from "@/components/WarehouseStatusProvider";
import { FilterBar } from "@/components/FilterBar";
import { FloorEmptyPanel } from "@/components/shared/FloorEmptyPanel";
import { FloorPageIntroBanner } from "@/components/shared/FloorPageIntroBanner";
import { RobotCard } from "./RobotCard";
import { FleetSkeleton } from "./FleetSkeleton";

type FleetFilter = "all" | "connected" | "disconnected" | "working" | "idle";

function matchesFleetFilter(robot: Robot, filter: FleetFilter) {
  if (filter === "all") return true;
  if (filter === "connected") return robot.status !== "offline";
  if (filter === "disconnected") return robot.status === "offline";
  if (filter === "working") return robot.status === "working" || robot.status === "returning";
  return robot.status === "idle" || robot.status === "charging";
}

export function FleetClient() {
  const { signedIn, loading: authLoading } = useAuth();
  const { warehouseConnected, loading: warehouseLoading } = useWarehouseStatus();
  const [robots, setRobots] = useState<Robot[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FleetFilter>("all");

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    get<unknown>("/api/robots")
      .then((data) => {
        if (!cancelled) setRobots(asList<Robot>(data, "robots"));
      })
      .catch(() => {
        if (!cancelled) setRobots([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn]);

  const filterOptions = useMemo(
    () => [
      { id: "all" as const, label: "All", count: robots.length },
      {
        id: "connected" as const,
        label: "Connected",
        count: robots.filter((r) => r.status !== "offline").length,
      },
      {
        id: "disconnected" as const,
        label: "Disconnected",
        count: robots.filter((r) => r.status === "offline").length,
      },
      {
        id: "working" as const,
        label: "Working",
        count: robots.filter((r) => r.status === "working" || r.status === "returning").length,
      },
      {
        id: "idle" as const,
        label: "Idle",
        count: robots.filter((r) => r.status === "idle" || r.status === "charging").length,
      },
    ],
    [robots],
  );

  const filtered = useMemo(
    () => robots.filter((robot) => matchesFleetFilter(robot, filter)),
    [robots, filter],
  );

  if (!signedIn) return null;
  if (authLoading || loading || (!robots.length && warehouseLoading)) {
    return <FleetSkeleton showIntro={warehouseLoading || warehouseConnected} />;
  }

  if (!robots.length) {
    const showIntro = !warehouseLoading && warehouseConnected;
    return (
      <div className="floor-empty-stack">
        {showIntro ? (
          <FloorPageIntroBanner
            icon={Layers}
            title="Fleet"
            message="Warehouse is connected. Pair robots from the board to see them here."
          />
        ) : null}
        <FloorEmptyPanel
          fill
          icon={Layers}
          title="No robots paired"
          description="Pair robots from the warehouse board first."
        />
      </div>
    );
  }

  return (
    <div className={filtered.length ? "flex flex-col gap-4" : "floor-filter-stack"}>
      <FilterBar options={filterOptions} value={filter} onChange={setFilter} />

      {filtered.length ? (
        <div className="flex flex-col gap-3">
          {filtered.map((robot) => (
            <RobotCard key={robot.id} robot={robot} />
          ))}
        </div>
      ) : (
        <FloorEmptyPanel
          stretch
          icon={Layers}
          title="No robots here"
          description="Try another filter to see more of the fleet."
        />
      )}
    </div>
  );
}
