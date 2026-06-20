import { PackageCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function TaskStoreOrderCard({
  orderRef,
}: {
  orderRef: string;
  status?: string | null;
}) {
  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-[#0f766e] to-[#14b8a6] py-0 text-white shadow-[0_10px_32px_rgba(15,118,110,0.22)] ring-0">
      <CardContent className="relative min-h-[100px] overflow-hidden px-4 py-4">
        <PackageCheck
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 size-24 text-white/20"
          strokeWidth={1.6}
        />

        <div className="relative max-w-[88%]">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/80">Pick request</p>
          <p className="font-heading mt-1.5 text-[18px] font-semibold leading-tight tracking-tight">
            Request {orderRef}
          </p>
          <p className="mt-2.5 text-[13px] leading-relaxed text-white/88">
            From your garage shop — see progress below.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
