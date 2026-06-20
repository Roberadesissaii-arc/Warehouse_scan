"use client";

import { useEffect, useState } from "react";
import {
  getPreferences,
  setPreference,
  subscribePreferences,
  type ScanPreferences,
} from "@/lib/preferences";

export function useScanPreferences() {
  const [preferences, setPreferences] = useState(() => getPreferences());

  useEffect(() => subscribePreferences(() => setPreferences(getPreferences())), []);

  function update<K extends keyof ScanPreferences>(key: K, value: ScanPreferences[K]) {
    setPreference(key, value);
  }

  return { preferences, update };
}
