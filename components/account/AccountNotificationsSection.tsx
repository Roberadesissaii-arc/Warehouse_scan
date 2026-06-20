import { ShoppingBag } from "lucide-react";
import { SettingsRow, SettingsSection } from "@/components/shared/SettingsSection";
import { Switch } from "@/components/ui/switch";
import type { ScanPreferences } from "@/lib/preferences";

export function AccountNotificationsSection({
  preferences,
  onChange,
}: {
  preferences: ScanPreferences;
  onChange: <K extends keyof ScanPreferences>(key: K, value: ScanPreferences[K]) => void;
}) {
  return (
    <SettingsSection
      title="Notifications"
      description="Pick requests from your garage in the bell at the top of the app"
      icon={ShoppingBag}
    >
      <SettingsRow
        icon={ShoppingBag}
        title="Pick request alerts"
        description="Show a badge when you request items from the garage shop"
        trailing={
          <Switch
            checked={preferences.storeOrderAlerts}
            onCheckedChange={(checked) => onChange("storeOrderAlerts", checked)}
          />
        }
      />
    </SettingsSection>
  );
}
