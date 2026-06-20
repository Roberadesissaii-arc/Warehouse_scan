"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { get, type Me } from "@/lib/api";

type AuthState = {
  me: Me | null;
  signedIn: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<Me>;
};

const AuthContext = createContext<AuthState | null>(null);

const PUBLIC_PATHS = new Set(["/sign-in"]);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<Me> => {
    setError(null);
    try {
      const data = await get<Me>("/api/me");
      setMe(data);
      return data;
    } catch (err) {
      setMe(null);
      const message = err instanceof Error ? err.message : "Could not reach the scan API";
      setError(message);
      throw err instanceof Error ? err : new Error(message);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      await refresh();
      if (!cancelled) setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [refresh]);

  useEffect(() => {
    if (loading) return;

    const isPublic = PUBLIC_PATHS.has(pathname);
    const signedIn = Boolean(me?.signed_in);

    if (!signedIn && !isPublic) {
      router.replace("/sign-in");
    }
    // Stay on /sign-in even when a session exists — user may be switching accounts.
    // Successful login navigates from SignInForm; failed login must show errors here.
  }, [loading, me?.signed_in, pathname, router]);

  const value = useMemo(
    () => ({ me, signedIn: Boolean(me?.signed_in), loading, error, refresh }),
    [me, loading, error, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useAuthGuard() {
  const { me, signedIn, loading, error } = useAuth();
  return { me, signedIn, loading, error };
}
