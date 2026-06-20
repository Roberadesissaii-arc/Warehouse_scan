"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Hand, Package, ScanLine } from "lucide-react";
import { get, post, type Bootstrap, type Task, type WarehouseItem } from "@/lib/api";
import { getPreferences, subscribePreferences } from "@/lib/preferences";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { SettingsInfoRow, SettingsSection } from "@/components/shared/SettingsSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ItemDetailIntro } from "./ItemDetailIntro";

const OPEN_PICK_STATUSES = new Set(["queued", "in_progress", "preparing", "picking", "delayed", "placed"]);

function pickStorageKey(itemId: number) {
  return `scan-item-pick-${itemId}`;
}

function hasOpenPickTask(tasks: Task[], itemId: number) {
  return tasks.some(
    (task) =>
      task.action === "pick" &&
      task.item_id === itemId &&
      OPEN_PICK_STATUSES.has(task.status),
  );
}

function ItemDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-[120px] rounded-2xl" />
      <Skeleton className="h-[180px] rounded-2xl" />
      <Skeleton className="h-[140px] rounded-2xl" />
    </div>
  );
}

export function ItemClient({ itemId }: { itemId: number }) {
  const { signedIn } = useAuth();
  const { showToast } = useToast();
  const [item, setItem] = useState<WarehouseItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [robots, setRobots] = useState<{ id: number; name: string; status: string; paired?: boolean }[]>([]);
  const [robotId, setRobotId] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pickQueued, setPickQueued] = useState(false);
  const [manualPickMode, setManualPickMode] = useState(() => getPreferences().manualPickMode);

  useEffect(() => subscribePreferences(() => setManualPickMode(getPreferences().manualPickMode)), []);

  useEffect(() => {
    if (!signedIn || !itemId) return;
    let cancelled = false;
    Promise.all([
      get<WarehouseItem>(`/api/items/${itemId}`),
      get<Bootstrap>("/api/bootstrap"),
    ])
      .then(([found, boot]) => {
        if (cancelled) return;
        setItem(found);
        const paired = (boot.robots || []).filter((r) => r.paired && r.status !== "offline");
        setRobots(paired);
        if (paired[0]) setRobotId(paired[0].id);

        const queued =
          hasOpenPickTask(boot.tasks || [], found.id) ||
          (typeof window !== "undefined" && sessionStorage.getItem(pickStorageKey(found.id)) === "1");
        setPickQueued(queued);
      })
      .catch(() => {
        if (!cancelled) setItem(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [signedIn, itemId]);

  async function submitPick() {
    if (!robotId || !item || pickQueued) return;
    setBusy(true);
    try {
      await post("/api/tasks", {
        robot_id: robotId,
        action: "pick",
        item_id: item.id,
        quantity,
      });
      sessionStorage.setItem(pickStorageKey(item.id), "1");
      setPickQueued(true);
      showToast("Pick task queued");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not queue task", true);
    } finally {
      setBusy(false);
    }
  }

  function onSendPickClick() {
    if (!robotId || !item || pickQueued) return;
    if (getPreferences().confirmRobotPick) {
      setConfirmOpen(true);
      return;
    }
    void submitPick();
  }

  if (loading) return <ItemDetailSkeleton />;

  if (!item) {
    return (
      <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.06)] ring-0">
        <CardContent className="p-8 text-center text-sm text-muted-foreground">Item not found.</CardContent>
      </Card>
    );
  }

  const actionsLocked = pickQueued || busy;

  return (
    <div className="flex flex-col gap-4">
      <ItemDetailIntro item={item} />

      {manualPickMode ? (
        <SettingsSection
          title="Manual pick"
          description="Pull this item yourself — robot queue is off"
          icon={Hand}
        >
          <p className="rounded-xl bg-white px-3 py-3 text-[13px] leading-relaxed text-muted-foreground shadow-[0_1px_4px_rgba(26,31,30,0.06)]">
            Go to the location above and pull the quantity you need. Turn off manual pick mode in Account if you
            want the robot to handle it.
          </p>
          <Link
            href="/scan"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#0f766e] text-[15px] font-medium text-white hover:bg-[#0d655e]"
          >
            <ScanLine size={18} />
            Scan another item
          </Link>
        </SettingsSection>
      ) : (
        <SettingsSection
          title="Actions"
          description={
            pickQueued ? "A robot is already working on this pick" : "Send a robot to pick this item"
          }
          icon={CheckCircle2}
        >
          <div className="space-y-3 rounded-xl bg-white p-3 shadow-[0_1px_4px_rgba(26,31,30,0.06)]">
            {pickQueued ? (
              <p className="rounded-xl bg-[var(--accent-soft)] px-3 py-3 text-[13px] leading-relaxed text-[#0f766e]">
                Pick task sent — the robot is on it. Check Tasks for progress.
              </p>
            ) : null}

            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-muted-foreground" htmlFor="robot-select">
                Robot
              </label>
              <select
                id="robot-select"
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-base disabled:opacity-60"
                value={robotId}
                disabled={actionsLocked}
                onChange={(e) => setRobotId(Number(e.target.value))}
              >
                {robots.length ? (
                  robots.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.status})
                    </option>
                  ))
                ) : (
                  <option value="">No online robots</option>
                )}
              </select>

              <label className="mt-3 block text-[13px] font-semibold text-muted-foreground" htmlFor="pick-qty">
                Quantity
              </label>
              <input
                id="pick-qty"
                className="h-12 w-full rounded-xl border border-[var(--border)] bg-white px-4 text-base disabled:opacity-60"
                type="number"
                min={1}
                max={Math.max(item.quantity || 1, 1)}
                value={quantity}
                disabled={actionsLocked}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <Button
              type="button"
              className="h-12 w-full rounded-2xl bg-[#0f766e] text-[15px] hover:bg-[#0d655e] disabled:opacity-60"
              disabled={!robots.length || actionsLocked}
              onClick={onSendPickClick}
            >
              {busy ? "Queuing…" : pickQueued ? "Pick task sent" : "Send pick task"}
            </Button>
          </div>
        </SettingsSection>
      )}

      <SettingsSection title="Product details" description="What you scanned on the floor" icon={Package}>
        <SettingsInfoRow label="Item ID" value={`#${item.id}`} />
        <SettingsInfoRow label="Name" value={item.name} />
        {item.sku ? <SettingsInfoRow label="SKU" value={item.sku} /> : null}
        <SettingsInfoRow label="On shelf" value={String(item.quantity ?? 0)} />
        {item.notes ? <SettingsInfoRow label="Notes" value={item.notes} /> : null}
      </SettingsSection>

      <ConfirmDialog
        open={confirmOpen}
        title="Send pick task?"
        message={`Send a pick task to the robot for ${quantity}× ${item.name}?`}
        confirmLabel="Send pick task"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          void submitPick();
        }}
      />
    </div>
  );
}
