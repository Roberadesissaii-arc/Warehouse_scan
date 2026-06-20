import Link from "next/link";
import { ChevronRight, Layers } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

function fleetHint(pct: number, empty: boolean) {
  if (empty) return "No robots paired yet. Add units from the warehouse board.";
  if (pct >= 80) return "Strong coverage on the floor right now.";
  if (pct >= 50) return "Some robots are idle or charging.";
  return "Check fleet — several units are offline.";
}

export function HomeFleetAvailability({
  onlineRobots,
  totalRobots,
  fleetPct,
}: {
  onlineRobots: number;
  totalRobots: number;
  fleetPct: number;
}) {
  const empty = totalRobots === 0;

  return (
    <Link
      href="/fleet"
      className="block rounded-2xl outline-none transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
    >
      <Card className="gap-0 overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-[#0f766e] to-[#14b8a6] py-0 text-white shadow-[0_10px_32px_rgba(15,118,110,0.28)] ring-0">
        <CardContent className="relative min-h-[148px] overflow-hidden px-5 py-6">
          <Layers
            aria-hidden
            className="pointer-events-none absolute -right-7 -top-7 size-[7.5rem] text-white/22"
            strokeWidth={1.6}
          />

          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 max-w-[85%]">
                <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/80">Fleet</p>
                <p className="font-heading mt-2 text-[22px] font-bold leading-tight tracking-tight">
                  {empty ? "Availability" : `${fleetPct}% available`}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-white/18 px-2.5 py-1 text-[11px] font-bold tabular-nums text-white">
                {onlineRobots}/{totalRobots} online
              </span>
            </div>

            <div
              className="mt-5 h-2.5 w-full overflow-hidden rounded-full bg-white/22"
              role="progressbar"
              aria-valuenow={empty ? 0 : fleetPct}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Fleet availability"
            >
              <div
                className="h-full rounded-full bg-white transition-all duration-500"
                style={{ width: empty ? "0%" : `${fleetPct}%` }}
              />
            </div>

            <div className="mt-4 flex items-end justify-between gap-3">
              <p className="text-[14px] leading-relaxed text-white/92">{fleetHint(fleetPct, empty)}</p>
              <ChevronRight className="mb-0.5 size-5 shrink-0 text-white/80" aria-hidden />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
