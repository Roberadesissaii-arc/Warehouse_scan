import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SettingsSection({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <Card className="gap-0 rounded-2xl border-0 bg-white py-0 shadow-[0_6px_28px_rgba(26,31,30,0.08)] ring-0">
      <CardContent className="p-4">
        <div className="mb-3 flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <Icon size={19} strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h2 className="text-[15px] font-semibold tracking-tight text-[var(--text)]">{title}</h2>
            {description ? (
              <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{description}</p>
            ) : null}
          </div>
        </div>
        <div className="space-y-2 rounded-xl bg-[var(--surface-2)] p-2">{children}</div>
      </CardContent>
    </Card>
  );
}

export function SettingsRow({
  icon: Icon,
  title,
  description,
  trailing,
  onClick,
  danger,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  trailing?: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  const className = cn(
    "flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-[0_1px_4px_rgba(26,31,30,0.06)] transition-colors",
    onClick && "active:bg-[var(--border)]/20",
  );

  const body = (
    <>
      <div
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700 shadow-[0_1px_4px_rgba(26,31,30,0.04)]",
          danger && "bg-red-50 text-destructive",
        )}
      >
        <Icon size={20} strokeWidth={2.1} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={cn("text-[15px] font-semibold leading-tight", danger && "text-destructive")}>{title}</p>
        {description ? (
          <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {trailing ? <div className="shrink-0">{trailing}</div> : null}
    </>
  );

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {body}
      </button>
    );
  }

  return <div className={className}>{body}</div>;
}

export function SettingsInfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl bg-white px-3 py-3 shadow-[0_1px_4px_rgba(26,31,30,0.06)]">
      <span className="shrink-0 text-[13px] font-medium text-muted-foreground">{label}</span>
      <span className="text-right text-[13px] font-semibold leading-snug text-[var(--text)] break-all">{value}</span>
    </div>
  );
}
