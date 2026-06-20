import type { NotificationItem } from "@/lib/api";

const OWN_ACTION_RE = /^(.+?)\s+(accepted pick|fulfilled pick)$/i;

/** True when this notification is about the signed-in user’s own accept/fulfill action. */
export function isOwnStaffActionNotification(
  item: NotificationItem,
  username?: string | null,
): boolean {
  const who = (username || "").trim().toLowerCase();
  if (!who) return false;
  const match = OWN_ACTION_RE.exec((item.title || "").trim());
  if (!match) return false;
  return match[1].trim().toLowerCase() === who;
}

/** Scan app bell: garage pick requests only — no robot or floor noise. */
export function isStoreOrderNotification(item: NotificationItem): boolean {
  if (item.kind === "store" || item.kind === "store_order") return true;
  const text = `${item.title} ${item.body || ""}`.toLowerCase();
  if (/robot|fleet|unit\s*#|offline|charging|working/.test(text)) return false;
  if (/accepted pick|fulfilled pick|pick request/.test(text)) return true;
  return /\b(order|store|request|garage)\b/.test(text);
}

export function filterScanNotifications(
  items: NotificationItem[],
  username?: string | null,
): NotificationItem[] {
  return items.filter(
    (item) => isStoreOrderNotification(item) && !isOwnStaffActionNotification(item, username),
  );
}

/** @deprecated Use filterScanNotifications */
export function filterStoreOrderNotifications(items: NotificationItem[]): NotificationItem[] {
  return filterScanNotifications(items);
}

export function countUnreadScanNotifications(
  items: NotificationItem[],
  username?: string | null,
): number {
  return filterScanNotifications(items, username).filter((item) => !item.read).length;
}

export function countUnreadStoreOrders(items: NotificationItem[]): number {
  return filterScanNotifications(items).filter((item) => !item.read).length;
}
