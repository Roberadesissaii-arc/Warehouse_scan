"use client";

import { FormEvent, useState } from "react";
import { UserRound } from "lucide-react";
import { put } from "@/lib/api";
import { setRememberDevice, getRememberDevice } from "@/lib/remember";
import { useToast } from "@/components/ToastProvider";
import { SettingsSection } from "@/components/shared/SettingsSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function validateNewPassword(password: string): string | null {
  if (!password) return null;
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "Password needs at least one letter and one number";
  }
  return null;
}

export function AccountCredentialsSection({
  username,
  onUpdated,
}: {
  username: string;
  onUpdated: (nextUsername: string) => void;
}) {
  const { showToast } = useToast();
  const [nextUsername, setNextUsername] = useState(username);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmedUsername = nextUsername.trim();
    if (!trimmedUsername) {
      showToast("Username is required", true);
      return;
    }
    if (!currentPassword) {
      showToast("Enter your current password", true);
      return;
    }
    const passwordError = validateNewPassword(newPassword);
    if (passwordError) {
      showToast(passwordError, true);
      return;
    }

    setBusy(true);
    try {
      const res = await put<{ ok?: boolean; username?: string }>("/api/account", {
        username: trimmedUsername,
        current_password: currentPassword,
        new_password: newPassword.trim() || undefined,
      });
      const saved = res.username || trimmedUsername;
      setCurrentPassword("");
      setNewPassword("");
      setNextUsername(saved);
      if (getRememberDevice()) {
        setRememberDevice(true, saved);
      }
      onUpdated(saved);
      showToast("Profile updated");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Could not update profile", true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SettingsSection
      title="Login profile"
      description="Change your username and password — current password required"
      icon={UserRound}
    >
      <form className="space-y-3" onSubmit={(e) => void onSubmit(e)}>
        <p className="text-[12px] leading-relaxed text-muted-foreground">
          Scan login is stored in <strong className="font-semibold text-[var(--text)]">Warehouse_scan/instance/scan.db</strong> on
          this server. First visit creates the one owner account. Inventory and tasks come from WarehouseDB over the API.
        </p>

        <div className="space-y-2">
          <Label htmlFor="profile-username" className="text-[13px] font-semibold text-muted-foreground">
            Username
          </Label>
          <Input
            id="profile-username"
            className="h-12 rounded-xl border-0 bg-white px-4 text-base shadow-[0_1px_4px_rgba(26,31,30,0.06)]"
            autoComplete="username"
            value={nextUsername}
            onChange={(e) => setNextUsername(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-current-password" className="text-[13px] font-semibold text-muted-foreground">
            Current password
          </Label>
          <Input
            id="profile-current-password"
            type="password"
            className="h-12 rounded-xl border-0 bg-white px-4 text-base shadow-[0_1px_4px_rgba(26,31,30,0.06)]"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="profile-new-password" className="text-[13px] font-semibold text-muted-foreground">
            New password
          </Label>
          <Input
            id="profile-new-password"
            type="password"
            className="h-12 rounded-xl border-0 bg-white px-4 text-base shadow-[0_1px_4px_rgba(26,31,30,0.06)]"
            autoComplete="new-password"
            placeholder="Leave blank to keep current"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <p className="text-[12px] text-muted-foreground">At least 8 characters with a letter and a number.</p>
        </div>

        <Button
          type="submit"
          className="h-12 w-full rounded-2xl bg-[#0f766e] text-[15px] hover:bg-[#0d655e]"
          disabled={busy}
        >
          {busy ? "Saving…" : "Save profile"}
        </Button>
      </form>
    </SettingsSection>
  );
}
