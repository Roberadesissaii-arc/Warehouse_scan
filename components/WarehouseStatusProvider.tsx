"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { get, type Bootstrap } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

const OFFLINE_MESSAGE =
  "WarehouseDB is not connected — tasks and inventory will appear when it is online.";

type WarehouseStatusState = {
  boot: Bootstrap | null;
  warehouseConnected: boolean;
  message: string | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

const WarehouseStatusContext = createContext<WarehouseStatusState | null>(null);

export function WarehouseStatusProvider({ children }: { children: React.ReactNode }) {
  const { signedIn } = useAuth();
  const [boot, setBoot] = useState<Bootstrap | null>(null);
  const [warehouseConnected, setWarehouseConnected] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!signedIn) {
      setBoot(null);
      setWarehouseConnected(true);
      setMessage(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const data = await get<Bootstrap & { warehouse_connected?: boolean; message?: string }>("/api/bootstrap");
      setBoot(data);
      const connected = data.warehouse_connected !== false;
      setWarehouseConnected(connected);
      setMessage(connected ? null : data.message || OFFLINE_MESSAGE);
    } catch {
      setBoot({ tasks: [], robots: [], items: [] });
      setWarehouseConnected(false);
      setMessage(OFFLINE_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, [signedIn]);

  useEffect(() => {
    void (async () => {
      await refresh();
    })();
  }, [refresh]);

  const value = useMemo(
    () => ({ boot, warehouseConnected, message, loading, refresh }),
    [boot, warehouseConnected, message, loading, refresh],
  );

  return <WarehouseStatusContext.Provider value={value}>{children}</WarehouseStatusContext.Provider>;
}

export function useWarehouseStatus() {
  const ctx = useContext(WarehouseStatusContext);
  if (!ctx) {
    throw new Error("useWarehouseStatus must be used within WarehouseStatusProvider");
  }
  return ctx;
}
