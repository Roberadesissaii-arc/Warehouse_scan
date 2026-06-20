"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Search, ShoppingBag, X } from "lucide-react";
import { get, post, put, del, type NotificationItem } from "@/lib/api";
import {
  countUnreadScanNotifications,
  filterScanNotifications,
} from "@/lib/notifications";
import { getPreferences, subscribePreferences } from "@/lib/preferences";
import { useAuth } from "@/components/AuthProvider";
import { useToast } from "@/components/ToastProvider";
import { cn } from "@/lib/utils";

function mapNotificationHref(href?: string | null) {
  if (!href) return "/tasks";
  if (href.startsWith("/tasks")) return href;
  return "/tasks";
}

export function AppTopBar() {
  const router = useRouter();
  const { signedIn, loading, me } = useAuth();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [searchBusy, setSearchBusy] = useState(false);
  const [unread, setUnread] = useState(0);
  const [panelOpen, setPanelOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifs, setLoadingNotifs] = useState(false);
  const [storeAlertsOn, setStoreAlertsOn] = useState(
    () => getPreferences().storeOrderAlerts,
  );
  const panelRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    return subscribePreferences(() => {
      setStoreAlertsOn(getPreferences().storeOrderAlerts);
    });
  }, []);

  useEffect(() => {
    if (!signedIn || !storeAlertsOn) return;

    let cancelled = false;

    async function poll() {
      try {
        const data = await get<NotificationItem[]>("/api/notifications");
        if (!cancelled) {
          setUnread(countUnreadScanNotifications(data, me?.username));
        }
      } catch {
        if (!cancelled) setUnread(0);
      }
    }

    void poll();
    const timer = window.setInterval(() => void poll(), 20_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [signedIn, storeAlertsOn, me?.username]);

  async function togglePanel() {
    if (panelOpen) {
      setPanelOpen(false);
      return;
    }
    setPanelOpen(true);
    setLoadingNotifs(true);
    try {
      const data = await get<NotificationItem[]>("/api/notifications");
      setNotifications(filterScanNotifications(data, me?.username));
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifs(false);
    }
  }

  useEffect(() => {
    if (!panelOpen) return;
    function onPointerDown(e: MouseEvent | TouchEvent) {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (notifyRef.current?.contains(target)) return;
      setPanelOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [panelOpen]);

  async function onSearch(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed || searchBusy) return;
    setSearchBusy(true);
    try {
      const data = await post<{ item: { id: number } }>("/api/resolve", { code: trimmed });
      setQuery("");
      router.push(`/i/${data.item.id}`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "No match for that code", true);
    } finally {
      setSearchBusy(false);
    }
  }

  async function openNotification(item: NotificationItem) {
    if (!item.read) {
      try {
        await put(`/api/notifications/${item.id}/read`, {});
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
        );
        setUnread((c) => Math.max(0, c - 1));
      } catch {
        /* still navigate */
      }
    }
    setPanelOpen(false);
    router.push(mapNotificationHref(item.href));
  }

  async function markAllRead() {
    try {
      await put("/api/notifications/read-all", {});
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
      showToast("All orders marked read");
    } catch {
      showToast("Could not mark orders read", true);
    }
  }

  async function clearAll() {
    try {
      await del("/api/notifications/clear-all");
      setNotifications([]);
      setUnread(0);
      showToast("Notifications cleared");
    } catch {
      showToast("Could not clear notifications", true);
    }
  }

  const hasUnread = notifications.some((n) => !n.read);

  const displayUnread = signedIn && storeAlertsOn ? unread : 0;

  if (!signedIn && !loading) return null;

  if (loading) {
    return (
      <div className="app-top-bar" aria-hidden>
        <div className="app-top-search-shell">
          <div className="app-top-search app-top-search--placeholder app-top-search-shell__inner" />
        </div>
        <div className="app-top-notify app-top-notify--placeholder" />
      </div>
    );
  }

  return (
    <>
      <div className="app-top-bar">
        <div className="app-top-search-shell">
          <div className="app-top-search-shell__ring" aria-hidden />
          <form className="app-top-search app-top-search-shell__inner" onSubmit={(e) => void onSearch(e)}>
            <Search size={18} className="shrink-0 text-[var(--text-soft)]" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search SKU, item, or code"
              aria-label="Search warehouse"
              enterKeyHint="search"
            />
          </form>
        </div>

        <button
          ref={notifyRef}
          type="button"
          className="app-top-notify"
          aria-label={displayUnread ? `${displayUnread} new pick requests` : "Pick requests"}
          aria-expanded={panelOpen}
          onClick={() => void togglePanel()}
        >
          <Bell size={20} strokeWidth={2.1} />
          {displayUnread > 0 ? (
            <span className="app-top-notify-badge">{displayUnread > 9 ? "9+" : displayUnread}</span>
          ) : null}
        </button>
      </div>

      {panelOpen ? (
        <div className="app-notify-layer" aria-hidden={false}>
          <div ref={panelRef} className="app-notify-panel" role="dialog" aria-label="Pick requests">
            <div className="app-notify-panel-head">
              <div>
                <h2>Pick requests</h2>
                <p>Items you asked for from your garage inventory</p>
              </div>
              <button type="button" className="app-notify-close" onClick={() => setPanelOpen(false)} aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <div className="app-notify-actions">
              <button
                type="button"
                className="app-notify-action"
                disabled={!hasUnread}
                onClick={() => void markAllRead()}
              >
                Mark all read
              </button>
              <button
                type="button"
                className="app-notify-action app-notify-action--clear"
                disabled={!notifications.length}
                onClick={() => void clearAll()}
              >
                Clear
              </button>
            </div>

            <div className="app-notify-list">
              {loadingNotifs ? (
                <p className="app-notify-empty">Loading requests…</p>
              ) : notifications.length ? (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={cn("app-notify-item", !item.read && "app-notify-item--unread")}
                    onClick={() => void openNotification(item)}
                  >
                    <span className="app-notify-item-icon app-notify-item-icon--store">
                      <ShoppingBag size={17} />
                    </span>
                    <span className="app-notify-item-copy">
                      <strong>{item.title}</strong>
                      {item.body ? <span>{item.body}</span> : null}
                    </span>
                  </button>
                ))
              ) : (
                <p className="app-notify-empty">No pick requests right now.</p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
