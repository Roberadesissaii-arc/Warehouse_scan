import { ScanLine } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ScanIntro() {
  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-[#0f766e] to-[#14b8a6] py-0 text-white shadow-[0_10px_32px_rgba(15,118,110,0.22)] ring-0">
      <CardContent className="relative min-h-[100px] overflow-hidden px-4 py-5">
        <ScanLine
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 size-24 text-white/20"
          strokeWidth={1.6}
        />

        <div className="relative max-w-[88%]">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/80">Floor scan</p>
          <h1 className="font-heading mt-1.5 text-[22px] font-bold leading-tight tracking-tight">Scan a label</h1>
          <p className="mt-2.5 text-[13px] leading-relaxed text-white/90">
            Use the camera or type a code to jump straight to an item on your garage floor.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
