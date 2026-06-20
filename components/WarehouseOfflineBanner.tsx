"use client";

import { ServerOff } from "lucide-react";

export function WarehouseOfflineBanner({ message }: { message: string }) {
  return (
    <div className="warehouse-offline-banner" role="status">
      <div className="warehouse-offline-banner__ring" aria-hidden />
      <div className="warehouse-offline-banner__inner">
        <div className="warehouse-offline-banner__copy">
          <p className="warehouse-offline-banner__title">Warehouse offline</p>
          <p className="warehouse-offline-banner__text">{message}</p>
        </div>
        <ServerOff className="warehouse-offline-banner__icon" aria-hidden />
      </div>
    </div>
  );
}
