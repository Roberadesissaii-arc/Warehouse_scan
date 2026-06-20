import { UserRound } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export function AccountProfileCard({ displayName }: { displayName: string }) {
  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-0 bg-gradient-to-br from-[#0f766e] to-[#14b8a6] py-0 text-white shadow-[0_10px_32px_rgba(15,118,110,0.28)] ring-0">
      <CardContent className="relative p-5">
        <UserRound
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-6 size-[7rem] text-white/20"
          strokeWidth={1.5}
        />
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/80">Your account</p>
        <h2 className="font-heading mt-1 text-2xl font-bold leading-tight tracking-tight">{displayName}</h2>
        <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-white/90">
          Warehouse staff session. Tasks and scans stay in sync with the main board.
        </p>
        <div className="mt-4 inline-flex">
          <Badge className="border-0 bg-white/20 px-3 py-1 text-[12px] font-semibold text-white hover:bg-white/20">
            Floor staff
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
