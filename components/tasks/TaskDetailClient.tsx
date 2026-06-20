"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ClipboardList, UserRound } from "lucide-react";
import { get, post, type Task } from "@/lib/api";
import { parseTaskNote } from "@/lib/taskNote";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { SettingsInfoRow, SettingsSection } from "@/components/shared/SettingsSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TaskDetailIntro } from "./TaskDetailIntro";
import { TaskProgressSection } from "./TaskProgressSection";
import { TaskStoreOrderCard } from "./TaskStoreOrderCard";

function TaskDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-[112px] rounded-2xl" />
      <Skeleton className="h-[100px] rounded-2xl" />
      <div className="space-y-2.5">
        <Skeleton className="h-[72px] rounded-2xl" />
        <Skeleton className="h-[72px] rounded-2xl" />
      </div>
    </div>
  );
}

export function TaskDetailClient({ taskId }: { taskId: number }) {
  const { signedIn } = useAuth();
  const { showToast } = useToast();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!signedIn || !taskId) return;
    let cancelled = false;
    get<Task>(`/api/tasks/${taskId}`)
      .then((data) => {
        if (!cancelled) setTask(data);
      })
      .catch(() => {
        if (!cancelled) setTask(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn, taskId]);

  async function acceptTask() {
    try {
      const updated = await post<Task>(`/api/tasks/${taskId}/accept`, {});
      setTask({
        ...updated,
        status: updated.status || "in_progress",
        store_order_status: updated.store_order_status ?? (updated.store_order_ref ? "picking" : undefined),
      });
      showToast("Pick accepted — you are handling it");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not accept task", true);
    }
  }

  async function fulfillTask() {
    try {
      const updated = await post<Task>(`/api/tasks/${taskId}/fulfill`, {});
      setTask({
        ...updated,
        status: "done",
        store_order_status: updated.store_order_ref ? "done" : updated.store_order_status,
      });
      showToast(updated.store_order_ref
        ? `Request ${updated.store_order_ref} marked ready`
        : "Pick marked fulfilled");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not fulfill task", true);
    }
  }

  if (loading) return <TaskDetailSkeleton />;

  if (!task) {
    return (
      <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.06)] ring-0">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">Task not found.</CardContent>
      </Card>
    );
  }

  const parsedNote = parseTaskNote(task.note);
  const isStoreOrder = Boolean(task.store_order_ref);
  const cancelled = task.status === "cancelled";
  const assigned =
    task.status === "in_progress" || task.status === "done" || Boolean(task.staff_username);
  const completed = task.status === "done";

  return (
    <div className="flex flex-col gap-4">
      <TaskDetailIntro task={task} />

      <SettingsSection title="Task details" description="Assignment, quantity, and request info" icon={ClipboardList}>
        <SettingsInfoRow label="Task ID" value={`#${task.id}`} />
        <SettingsInfoRow label="Action" value={(task.action || "task").toUpperCase()} />
        <SettingsInfoRow label="Robot" value={task.robot || "—"} />
        <SettingsInfoRow label="Quantity" value={String(task.quantity || 1)} />
        {task.staff_username ? (
          <SettingsInfoRow label="Handled by" value={task.staff_username} />
        ) : (
          <SettingsInfoRow label="Handled by" value="Not assigned yet" />
        )}
        {task.section ? <SettingsInfoRow label="Section" value={task.section} /> : null}
        {task.item ? <SettingsInfoRow label="Item" value={task.item} /> : null}
        {isStoreOrder && parsedNote?.rush ? (
          <SettingsInfoRow label="Priority" value="Rush" />
        ) : null}
        {isStoreOrder && parsedNote?.requestedBy ? (
          <SettingsInfoRow label="Ordered by" value={parsedNote.requestedBy} />
        ) : null}
        {parsedNote?.instructions ? (
          <SettingsInfoRow label={isStoreOrder ? "Instructions" : "Note"} value={parsedNote.instructions} />
        ) : null}
        {!isStoreOrder && task.note && !parsedNote?.instructions ? (
          <SettingsInfoRow label="Note" value={task.note} />
        ) : null}
      </SettingsSection>

      {isStoreOrder && task.store_order_ref ? (
        <TaskStoreOrderCard orderRef={task.store_order_ref} status={task.store_order_status} />
      ) : null}

      <TaskProgressSection task={task} />

      {!cancelled ? (
        <SettingsSection
          title="Actions"
          description={
            completed
              ? "This pick is finished on the floor"
              : "Take over from the robot or mark ready"
          }
          icon={CheckCircle2}
        >
          <div className="space-y-3">
            <Button
              type="button"
              variant="secondary"
              disabled={assigned}
              className="h-12 w-full rounded-2xl bg-white text-[15px] shadow-[0_1px_4px_rgba(26,31,30,0.06)] disabled:opacity-100"
              onClick={() => {
                if (!assigned) void acceptTask();
              }}
            >
              {assigned ? <CheckCircle2 size={18} /> : <UserRound size={18} />}
              {assigned ? "Assigned" : "Accept pick (I'm handling it)"}
            </Button>
            <Button
              type="button"
              disabled={completed}
              className="h-12 w-full rounded-2xl bg-[#0f766e] text-[15px] hover:bg-[#0d655e] disabled:opacity-100 disabled:bg-[#0f766e]"
              onClick={() => {
                if (!completed) void fulfillTask();
              }}
            >
              <CheckCircle2 size={18} />
              {completed ? "Completed" : "Mark fulfilled"}
            </Button>
          </div>
        </SettingsSection>
      ) : null}
    </div>
  );
}
