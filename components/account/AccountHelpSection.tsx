import { Camera, HelpCircle, LayoutList } from "lucide-react";
import Link from "next/link";
import type { AppConfig } from "@/lib/api";
import { SettingsInfoRow, SettingsSection } from "@/components/shared/SettingsSection";

export function AccountHelpSection({ config }: { config: AppConfig | null }) {
  return (
    <SettingsSection title="Help & app" description="Version info and floor tips" icon={HelpCircle}>
      <SettingsInfoRow label="App" value={config?.app_name || "Warehouse Scan"} />
      <SettingsInfoRow label="Version" value={config?.version || "—"} />
      <SettingsInfoRow label="Warehouse" value={config?.warehouse_url || "—"} />

      <Link
        href="/tasks"
        className="flex w-full items-center gap-3 rounded-xl bg-white p-3 shadow-[0_1px_4px_rgba(26,31,30,0.06)] transition-colors active:bg-[var(--border)]/20"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <LayoutList size={20} strokeWidth={2.1} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[15px] font-semibold leading-tight">View tasks</p>
          <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
            Accept picks, fulfill orders, and track robot work
          </p>
        </div>
      </Link>

      <div className="flex gap-3 rounded-xl bg-teal-50/80 p-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-teal-700 shadow-[0_1px_4px_rgba(26,31,30,0.06)]">
          <Camera size={18} strokeWidth={2.1} />
        </div>
        <p className="text-[13px] leading-relaxed text-teal-900/80">
          Camera scanning needs HTTPS or localhost. On the Scan tab, tap{" "}
          <strong className="font-semibold text-teal-950">Start camera</strong> and allow permission when prompted.
        </p>
      </div>
    </SettingsSection>
  );
}
