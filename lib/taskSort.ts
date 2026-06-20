import type { Task } from "@/lib/api";

/** Lower rank = higher in the list (floor staff view). */
const STATUS_RANK: Record<string, number> = {
  queued: 0,
  in_progress: 1,
  done: 2,
  cancelled: 3,
};

function taskTimestamp(task: Task) {
  if (task.created_at) {
    const ms = Date.parse(task.created_at);
    if (!Number.isNaN(ms)) return ms;
  }
  return task.id;
}

/** Queued pick requests first, then by progress, then newest. Done tasks sink to the bottom. */
export function sortTasksForFloor(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const rankA = STATUS_RANK[a.status] ?? 99;
    const rankB = STATUS_RANK[b.status] ?? 99;
    if (rankA !== rankB) return rankA - rankB;

    if (a.status === "queued") {
      const inquiryA = a.store_order_ref ? 0 : 1;
      const inquiryB = b.store_order_ref ? 0 : 1;
      if (inquiryA !== inquiryB) return inquiryA - inquiryB;
    }

    return taskTimestamp(b) - taskTimestamp(a);
  });
}
