const REMEMBER_KEY = "scan_remember_device";
const USERNAME_KEY = "scan_last_username";

export function getRememberDevice(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(REMEMBER_KEY) === "1";
}

export function saveLastUsername(username: string) {
  if (typeof window === "undefined") return;
  const name = username.trim();
  if (name) localStorage.setItem(USERNAME_KEY, name);
}

export function getLastUsername(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(USERNAME_KEY) || "";
}

export function setRememberDevice(on: boolean, username?: string) {
  if (typeof window === "undefined") return;
  if (on) {
    localStorage.setItem(REMEMBER_KEY, "1");
    if (username) saveLastUsername(username);
  } else {
    localStorage.removeItem(REMEMBER_KEY);
  }
}

/** Sign out — keep last username for the sign-in form. */
export function clearRememberSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(REMEMBER_KEY);
}

/** @deprecated use getLastUsername */
export function getRememberedUsername(): string {
  return getLastUsername();
}
