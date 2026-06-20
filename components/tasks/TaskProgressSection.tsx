import { ListOrdered } from "lucide-react";
import type { Task } from "@/lib/api";
import { SettingsSection } from "@/components/shared/SettingsSection";
import { cn } from "@/lib/utils";

const FLOOR_STEPS = [
  { id: "queued", label: "Queued" },
  { id: "in_progress", label: "In progress" },
  { id: "done", label: "Done" },
] as const;

const PICK_STEPS = [
  { id: "preparing", label: "Preparing", activeWhen: ["preparing", "delayed", "queued"] },
  { id: "picking", label: "Being picked", activeWhen: ["picking", "in_progress"] },
  { id: "ready", label: "Ready", activeWhen: ["done"] },
] as const;

function stepIndex(steps: readonly { id: string; activeWhen?: readonly string[] }[], key: string) {
  const idx = steps.findIndex((s) => s.id === key || s.activeWhen?.includes(key));
  return idx >= 0 ? idx : 0;
}

function resolvePickKey(task: Task): string {
  if (task.status === "done") return "done";
  if (task.status === "cancelled") return "cancelled";
  if (task.status === "in_progress") return "picking";
  if (task.status === "queued") {
    if (task.store_order_status === "delayed") return "delayed";
    return "preparing";
  }
  return task.store_order_status || "preparing";
}

function ProgressTrack({
  steps,
  activeIndex,
  complete,
}: {
  steps: readonly { id: string; label: string }[];
  activeIndex: number;
  complete: boolean;
}) {
  return (
    <ol className="flex w-full">
      {steps.map((step, index) => {
        const done = complete || index < activeIndex;
        const active = !complete && index === activeIndex;
        const first = index === 0;
        const last = index === steps.length - 1;
        const leftLineDone = !first && (complete || index - 1 < activeIndex);
        const rightLineDone = !last && (complete || index < activeIndex);
        return (
          <li key={step.id} className="flex min-w-0 flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              <span
                className={cn(
                  "h-0.5 rounded-full",
                  first ? "w-0 min-w-0 flex-none" : "flex-1",
                  !first && (leftLineDone ? "bg-[#0f766e]" : "bg-[var(--border)]"),
                )}
                aria-hidden
              />
              <span className="progress-step-dot-wrap" aria-hidden>
                {active ? <span className="progress-step-ring" /> : null}
                <span
                  className={cn(
                    "progress-step-dot",
                    done && "is-done",
                    active && "is-active",
                    !done && !active && "is-upcoming",
                  )}
                >
                  {done ? "✓" : index + 1}
                </span>
              </span>
              <span
                className={cn(
                  "h-0.5 rounded-full",
                  last ? "w-0 min-w-0 flex-none" : "flex-1",
                  !last && (rightLineDone ? "bg-[#0f766e]" : "bg-[var(--border)]"),
                )}
                aria-hidden
              />
            </div>
            <p
              className={cn(
                "mt-2 px-0.5 text-center text-[11px] font-semibold leading-tight",
                done || active ? "text-[#0f766e]" : "text-[var(--text-muted)]",
              )}
            >
              {step.label}
            </p>
          </li>
        );
      })}
    </ol>
  );
}

export function TaskProgressSection({ task }: { task: Task }) {
  const isStoreOrder = Boolean(task.store_order_ref);
  const pickKey = resolvePickKey(task);
  const steps = isStoreOrder ? PICK_STEPS : FLOOR_STEPS;
  const complete = task.status === "done";
  const activeIndex = complete
    ? steps.length - 1
    : isStoreOrder
      ? stepIndex(PICK_STEPS, pickKey)
      : stepIndex(
          FLOOR_STEPS.map((s) => ({ id: s.id, activeWhen: [s.id] })),
          task.status,
        );

  const robotNote = task.robot
    ? task.staff_username
      ? `${task.robot} · you took over`
      : task.status === "in_progress" || pickKey === "picking"
        ? `${task.robot} · working on it`
        : `${task.robot} · assigned`
    : null;

  return (
    <SettingsSection title="Progress" icon={ListOrdered}>
      <div className="px-3 pt-3">
        <ProgressTrack
          steps={steps}
          activeIndex={Math.min(activeIndex, steps.length - 1)}
          complete={complete}
        />
      </div>
      {robotNote ? (
        <p className="mt-4 px-3 pb-1 text-center text-[12px] font-medium text-[var(--text-muted)]">{robotNote}</p>
      ) : null}
    </SettingsSection>
  );
}
