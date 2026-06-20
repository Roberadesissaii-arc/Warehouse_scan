import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function QuickActionCard({
  href,
  icon: Icon,
  title,
  description,
  primary,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className="block rounded-2xl outline-none transition-transform active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[#0f766e] focus-visible:ring-offset-2"
    >
      <Card
        className={cn(
          "gap-0 rounded-2xl border-0 py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0",
          primary && "bg-gradient-to-br from-teal-50/90 to-emerald-50/80",
        )}
      >
        <CardContent className="flex items-center gap-3.5 p-5">
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl",
              primary ? "bg-[#0f766e] text-white shadow-sm" : "bg-teal-50 text-teal-700",
            )}
          >
            <Icon size={20} strokeWidth={2.2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[15px] font-semibold leading-tight">{title}</p>
            <p className="text-[13px] text-muted-foreground">{description}</p>
          </div>
          <ChevronRight className="size-[18px] shrink-0 text-muted-foreground" aria-hidden />
        </CardContent>
      </Card>
    </Link>
  );
}
