import { UserRound } from "lucide-react";
import { SettingsInfoRow, SettingsSection } from "@/components/shared/SettingsSection";

export function AccountProfileSection({
  displayName,
  rememberDevice,
}: {
  displayName: string;
  rememberDevice: boolean;
}) {
  return (
    <SettingsSection title="Profile" description="Your staff identity on this device" icon={UserRound}>
      <SettingsInfoRow label="Display name" value={displayName} />
      <SettingsInfoRow label="Role" value="Floor staff" />
      <SettingsInfoRow label="Session" value={rememberDevice ? "Remembered on this device" : "Browser session"} />
    </SettingsSection>
  );
}
