"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Camera, Keyboard, Search } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { CameraScanner } from "./CameraScanner";
import { ScanIntro } from "./ScanIntro";
import { ScanSkeleton } from "./ScanSkeleton";
import { post } from "@/lib/api";
import { getPreferences } from "@/lib/preferences";
import { useToast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ScanClient() {
  const router = useRouter();
  const { signedIn, loading: authLoading } = useAuth();
  const { showToast } = useToast();
  const [manual, setManual] = useState("");
  const [busy, setBusy] = useState(false);
  const manualRef = useRef<HTMLInputElement>(null);

  async function resolveCode(code: string) {
    const trimmed = code.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    try {
      const data = await post<{ item: { id: number } }>("/api/resolve", { code: trimmed });
      router.push(`/i/${data.item.id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not resolve code", true);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!getPreferences().preferManualLookup) return;
    manualRef.current?.focus();
  }, []);

  if (!signedIn) return null;
  if (authLoading) return <ScanSkeleton />;

  return (
    <div className="flex flex-col gap-4">
      <ScanIntro />

      <Card className="gap-0 overflow-hidden rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
        <CardContent className="p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Camera size={19} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">Camera scan</h2>
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                Point at a barcode or QR on the shelf label
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-[var(--surface-2)] p-4">
            <CameraScanner active onScan={resolveCode} />
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
        <CardContent className="p-5">
          <div className="mb-4 flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Keyboard size={19} strokeWidth={2.2} />
            </div>
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">Manual lookup</h2>
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground">
                SKU, WH:ITEM:12, or item URL
              </p>
            </div>
          </div>

          <form
            className="space-y-4 rounded-2xl bg-[var(--surface-2)] p-4"
            onSubmit={(e) => {
              e.preventDefault();
              void resolveCode(manual);
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="manual-code" className="text-[13px] font-semibold text-[var(--text-muted)]">
                Item code
              </Label>
              <Input
                ref={manualRef}
                id="manual-code"
                className="h-12 rounded-xl border-0 bg-white px-4 text-base shadow-[0_1px_4px_rgba(26,31,30,0.06)]"
                placeholder="Enter code"
                value={manual}
                onChange={(e) => setManual(e.target.value)}
                autoComplete="off"
                enterKeyHint="search"
              />
            </div>
            <Button
              type="submit"
              className="h-12 w-full rounded-2xl bg-[#0f766e] text-[15px] hover:bg-[#0d655e]"
              disabled={!manual.trim() || busy}
            >
              <Search size={18} />
              {busy ? "Looking up…" : "Look up item"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
