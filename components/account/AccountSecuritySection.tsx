import { Shield, Smartphone } from "lucide-react";
import { SettingsRow, SettingsSection } from "@/components/shared/SettingsSection";
import { Switch } from "@/components/ui/switch";

export function AccountSecuritySection({
  remember,
  busy,
  onRememberChange,
}: {
  remember: boolean;
  busy: boolean;
  onRememberChange: (checked: boolean) => void;
}) {
  return (
    <SettingsSection title="Security" description="Sign-in and device access" icon={Shield}>
      <SettingsRow
        icon={Smartphone}
        title="Remember this device"
        description="Stay signed in for 30 days on this phone or tablet"
        trailing={
          <Switch
            checked={remember}
            disabled={busy}
            onCheckedChange={(checked) => onRememberChange(checked)}
          />
        }
      />
    </SettingsSection>
  );
}
