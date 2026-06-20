"use client";

import { AppTopBar } from "@/components/AppTopBar";
import { BottomNav } from "@/components/BottomNav";
import { PageGate } from "@/components/PageGate";
import { WarehouseOfflineBanner } from "@/components/WarehouseOfflineBanner";
import { useWarehouseStatus } from "@/components/WarehouseStatusProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  const { warehouseConnected, message, loading } = useWarehouseStatus();
  const showOfflineBanner = !loading && !warehouseConnected && Boolean(message);

  return (
    <div className="app-shell">
      <header className="app-chrome-top">
        <AppTopBar />
      </header>
      <main className="app-main">
        <PageGate>
          {showOfflineBanner && message ? (
            <div className="warehouse-offline-banner-wrap">
              <WarehouseOfflineBanner message={message} />
            </div>
          ) : null}
          {children}
        </PageGate>
      </main>
      <BottomNav />
    </div>
  );
}
