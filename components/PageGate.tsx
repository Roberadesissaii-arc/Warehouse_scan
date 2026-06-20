"use client";

import { useAuth } from "@/components/AuthProvider";

export function PageGate({ children }: { children: React.ReactNode }) {
  const { error, signedIn, refresh } = useAuth();

  if (!signedIn) return null;

  if (error) {
    return (
      <div className="page-gate page-gate--error">
        <p>
          <strong>Cannot connect</strong>
        </p>
        <p>{error}</p>
        <p className="page-gate-hint">
          Start the API: <code>cd Warehouse_scan/backend && python run.py</code>
        </p>
        <button type="button" className="btn btn-primary" onClick={() => void refresh()}>
          Try again
        </button>
      </div>
    );
  }

  return children;
}
