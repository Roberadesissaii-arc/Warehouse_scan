export type ScanPreferences = {
  manualPickMode: boolean;
  confirmRobotPick: boolean;
  preferManualLookup: boolean;
  taskAlerts: boolean;
  storeOrderAlerts: boolean;
};

const STORAGE_KEY = "scan_preferences";

export const DEFAULT_PREFERENCES: ScanPreferences = {
  manualPickMode: false,
  confirmRobotPick: true,
  preferManualLookup: false,
  taskAlerts: true,
  storeOrderAlerts: true,
};

const PREFERENCE_EVENT = "scan-preferences-changed";

function readStored(): Partial<ScanPreferences> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Partial<ScanPreferences>;
  } catch {
    return {};
  }
}

export function getPreferences(): ScanPreferences {
  return { ...DEFAULT_PREFERENCES, ...readStored() };
}

export function setPreference<K extends keyof ScanPreferences>(key: K, value: ScanPreferences[K]) {
  if (typeof window === "undefined") return;
  const next = { ...getPreferences(), [key]: value };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(PREFERENCE_EVENT));
}

export function subscribePreferences(listener: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => listener();
  window.addEventListener(PREFERENCE_EVENT, handler);
  return () => window.removeEventListener(PREFERENCE_EVENT, handler);
}
