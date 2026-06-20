import { Hand, Keyboard, PackageCheck, ScanLine } from "lucide-react";
import Link from "next/link";
import { SettingsRow, SettingsSection } from "@/components/shared/SettingsSection";
import { Switch } from "@/components/ui/switch";
import type { ScanPreferences } from "@/lib/preferences";

export function AccountFloorWorkSection({
  preferences,
  onChange,
}: {
  preferences: ScanPreferences;
  onChange: <K extends keyof ScanPreferences>(key: K, value: ScanPreferences[K]) => void;
}) {
  return (
    <SettingsSection
      title="Floor work"
      description="How you scan, pick, and fulfill on the floor"
      icon={PackageCheck}
    >
      <SettingsRow
        icon={Hand}
        title="Manual pick mode"
        description="Scan items and pull stock yourself — robot pick queue stays hidden"
        trailing={
          <Switch
            checked={preferences.manualPickMode}
            onCheckedChange={(checked) => onChange("manualPickMode", checked)}
          />
        }
      />
      <SettingsRow
        icon={PackageCheck}
        title="Confirm robot picks"
        description="Ask before sending a pick task to a floor robot"
        trailing={
          <Switch
            checked={preferences.confirmRobotPick}
            disabled={preferences.manualPickMode}
            onCheckedChange={(checked) => onChange("confirmRobotPick", checked)}
          />
        }
      />
      <SettingsRow
        icon={Keyboard}
        title="Prefer manual lookup"
        description="Open the Scan tab on the keyboard field instead of the camera"
        trailing={
          <Switch
            checked={preferences.preferManualLookup}
            onCheckedChange={(checked) => onChange("preferManualLookup", checked)}
          />
        }
      />
      <Link
        href="/scan"
        className="flex w-full items-center gap-3 rounded-xl bg-white p-3 shadow-[0_1px_4px_rgba(26,31,30,0.06)] transition-colors active:bg-[var(--border)]/20"
      >
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
          <ScanLine size={20} strokeWidth={2.1} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="text-[15px] font-semibold leading-tight">Go to scan</p>
          <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
            Look up a shelf label or barcode right now
          </p>
        </div>
      </Link>
    </SettingsSection>
  );
}
