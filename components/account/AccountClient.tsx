"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { get, post, type AppConfig } from "@/lib/api";
import { clearRememberSession, getRememberDevice, setRememberDevice } from "@/lib/remember";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { AccountCredentialsSection } from "./AccountCredentialsSection";
import { AccountFloorWorkSection } from "./AccountFloorWorkSection";
import { AccountHelpSection } from "./AccountHelpSection";
import { AccountNotificationsSection } from "./AccountNotificationsSection";
import { AccountProfileCard } from "./AccountProfileCard";
import { AccountProfileSection } from "./AccountProfileSection";
import { AccountSecuritySection } from "./AccountSecuritySection";
import { AccountSignOutButton } from "./AccountSignOutButton";
import { AccountSkeleton } from "./AccountSkeleton";
import { useScanPreferences } from "@/hooks/useScanPreferences";

export function AccountClient() {
  const { me, refresh, signedIn, loading: authLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { preferences, update } = useScanPreferences();
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [rememberOverride, setRememberOverride] = useState<boolean | null>(null);
  const [rememberBusy, setRememberBusy] = useState(false);
  const [signOutBusy, setSignOutBusy] = useState(false);

  const displayName = me?.username || "Staff";
  const remember = rememberOverride ?? me?.remember_device ?? getRememberDevice();

  useEffect(() => {
    if (!signedIn) return;
    get<AppConfig>("/api/config")
      .then(setConfig)
      .catch(() => setConfig(null));
  }, [signedIn]);

  async function onRememberChange(checked: boolean) {
    setRememberBusy(true);
    try {
      await post("/api/auth/remember", { remember_device: checked });
      setRememberOverride(checked);
      setRememberDevice(checked, me?.username || undefined);
      await refresh();
      showToast(checked ? "This device will stay signed in" : "Session ends when you close the browser");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update setting", true);
    } finally {
      setRememberBusy(false);
    }
  }

  function onPreferenceChange<K extends keyof typeof preferences>(key: K, value: (typeof preferences)[K]) {
    update(key, value);
    if (key === "manualPickMode" && value) {
      showToast("Manual pick mode on — scan items and pull stock yourself");
    }
  }

  async function signOut() {
    setSignOutBusy(true);
    try {
      await post("/api/auth/logout", {});
      clearRememberSession();
      showToast("Signed out");
    } catch {
      /* still leave */
    }
    router.replace("/sign-in");
  }

  if (!signedIn) return null;
  if (authLoading || !me) return <AccountSkeleton />;

  return (
    <div className="flex flex-col gap-4">
      <AccountProfileCard displayName={displayName} />

      <AccountProfileSection displayName={displayName} rememberDevice={remember} />

      <AccountCredentialsSection
        key={displayName}
        username={displayName}
        firstName={me?.first_name || ""}
        lastName={me?.last_name || ""}
        email={me?.email || ""}
        onUpdated={async (nextUsername) => {
          await refresh();
          if (remember) setRememberDevice(true, nextUsername);
        }}
      />

      <AccountSecuritySection
        remember={remember}
        busy={rememberBusy}
        onRememberChange={(checked) => void onRememberChange(checked)}
      />

      <AccountFloorWorkSection preferences={preferences} onChange={onPreferenceChange} />

      <AccountNotificationsSection preferences={preferences} onChange={onPreferenceChange} />

      <AccountHelpSection config={config} />

      <AccountSignOutButton busy={signOutBusy} onSignOut={() => void signOut()} />
    </div>
  );
}
