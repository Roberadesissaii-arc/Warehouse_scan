"use client";

import { useEffect, useMemo, useState } from "react";
import { LayoutList } from "lucide-react";
import { get, asList, type Task } from "@/lib/api";
import { sortTasksForFloor } from "@/lib/taskSort";
import { useAuth } from "@/components/AuthProvider";
import { useWarehouseStatus } from "@/components/WarehouseStatusProvider";
import { FilterBar } from "@/components/FilterBar";
import { FloorEmptyPanel } from "@/components/shared/FloorEmptyPanel";
import { FloorPageIntroBanner } from "@/components/shared/FloorPageIntroBanner";
import { TaskCard } from "./TaskCard";
import { TasksSkeleton } from "./TasksSkeleton";

type TaskFilter = "all" | "queued" | "in_progress" | "done" | "store";

function matchesTaskFilter(task: Task, filter: TaskFilter) {
  if (filter === "all") return true;
  if (filter === "queued") return task.status === "queued";
  if (filter === "in_progress") return task.status === "in_progress";
  if (filter === "done") return task.status === "done" || task.status === "cancelled";
  return Boolean(task.store_order_ref);
}

export function TasksClient() {
  const { signedIn, loading: authLoading } = useAuth();
  const { warehouseConnected, loading: warehouseLoading } = useWarehouseStatus();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TaskFilter>("all");

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    get<unknown>("/api/tasks")
      .then((data) => {
        if (!cancelled) setTasks(asList<Task>(data, "tasks"));
      })
      .catch(() => {
        if (!cancelled) setTasks([]);
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
      { id: "all" as const, label: "All", count: tasks.length },
      {
        id: "queued" as const,
        label: "Queued",
        count: tasks.filter((t) => t.status === "queued").length,
      },
      {
        id: "in_progress" as const,
        label: "In progress",
        count: tasks.filter((t) => t.status === "in_progress").length,
      },
      {
        id: "done" as const,
        label: "Done",
        count: tasks.filter((t) => t.status === "done" || t.status === "cancelled").length,
      },
      {
        id: "store" as const,
        label: "Store",
        count: tasks.filter((t) => Boolean(t.store_order_ref)).length,
      },
    ],
    [tasks],
  );

  const filtered = useMemo(() => {
    const list = tasks.filter((task) => matchesTaskFilter(task, filter));
    return sortTasksForFloor(list);
  }, [tasks, filter]);

  if (!signedIn) return null;
  if (authLoading || loading || (!tasks.length && warehouseLoading)) {
    return <TasksSkeleton showIntro={warehouseLoading || warehouseConnected} />;
  }

  if (!tasks.length) {
    const showIntro = !warehouseLoading && warehouseConnected;
    return (
      <div className="floor-empty-stack">
        {showIntro ? (
          <FloorPageIntroBanner
            icon={LayoutList}
            title="Floor tasks"
            message="Warehouse is connected. Scan an item to queue your first pick."
          />
        ) : null}
        <FloorEmptyPanel
          fill
          icon={LayoutList}
          title="No tasks yet"
          description="Scan an item to queue robot work on the floor."
        />
      </div>
    );
  }

  return (
    <div className={filtered.length ? "flex flex-col gap-4" : "floor-filter-stack"}>
      <FilterBar options={filterOptions} value={filter} onChange={setFilter} />

      {filtered.length ? (
        <div className="flex flex-col gap-3">
          {filtered.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      ) : (
        <FloorEmptyPanel
          stretch
          icon={LayoutList}
          title="No tasks here"
          description="Try another filter to see more floor work."
        />
      )}
    </div>
  );
}
