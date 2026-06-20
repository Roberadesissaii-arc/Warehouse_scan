import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  value,
  label,
  tone = "teal",
}: {
  icon: LucideIcon;
  value: number | string;
  label: string;
  tone?: "teal" | "amber" | "emerald";
}) {
  const tones = {
    teal: "bg-teal-50 text-teal-700",
    amber: "bg-amber-50 text-amber-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };

  return (
    <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
      <CardContent className="p-5">
        <div className={cn("mb-3 flex size-9 items-center justify-center rounded-xl", tones[tone])}>
          <Icon size={18} strokeWidth={2.2} />
        </div>
        <p className="font-heading text-3xl font-bold leading-none tracking-tight text-[#0f766e]">{value}</p>
        <p className="mt-1.5 text-[12px] font-medium text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}
