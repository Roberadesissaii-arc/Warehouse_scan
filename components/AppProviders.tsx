"use client";

import { AuthProvider } from "@/components/AuthProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { WarehouseStatusProvider } from "@/components/WarehouseStatusProvider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WarehouseStatusProvider>
        <ToastProvider>{children}</ToastProvider>
      </WarehouseStatusProvider>
    </AuthProvider>
  );
}
