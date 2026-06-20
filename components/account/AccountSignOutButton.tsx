import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AccountSignOutButton({ onSignOut, busy }: { onSignOut: () => void; busy?: boolean }) {
  return (
    <div className="pt-1">
      <Button
        type="button"
        variant="outline"
        disabled={busy}
        className="h-12 w-full rounded-2xl border-0 bg-white text-[15px] font-semibold text-destructive shadow-[0_6px_28px_rgba(26,31,30,0.08)] hover:bg-red-50 hover:text-destructive"
        onClick={onSignOut}
      >
        <LogOut size={18} />
        Sign out
      </Button>
      <p className="mt-2 px-1 text-center text-[12px] leading-relaxed text-muted-foreground">
        Ends your staff session on this device.
      </p>
    </div>
  );
}
