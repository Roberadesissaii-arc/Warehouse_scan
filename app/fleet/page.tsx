import { AppShell } from "@/components/AppShell";
import { FleetClient } from "@/components/fleet";

export default function FleetPage() {
  return (
    <AppShell>
      <FleetClient />
    </AppShell>
  );
}
