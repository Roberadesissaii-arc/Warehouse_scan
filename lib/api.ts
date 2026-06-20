export type ApiError = Error & { status?: number };

const API_TIMEOUT_MS = 12_000;

async function parseJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(path, {
      ...options,
      signal: controller.signal,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    const data = await parseJson(res);
    if (!res.ok) {
      const err = new Error((data as { error?: string }).error || res.statusText || "Request failed") as ApiError;
      err.status = res.status;
      throw err;
    }
    return data as T;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new Error("Request timed out — is the scan API running on port 5003?");
    }
    throw err;
  } finally {
    window.clearTimeout(timeout);
  }
}

export const get = <T>(path: string) => api<T>(path);
export const post = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });

/** WarehouseDB list endpoints return arrays; offline proxy wraps them in { tasks } / { robots }. */
export function asList<T>(data: unknown, nestedKey?: string): T[] {
  if (Array.isArray(data)) return data as T[];
  if (nestedKey && data && typeof data === "object") {
    const nested = (data as Record<string, unknown>)[nestedKey];
    if (Array.isArray(nested)) return nested as T[];
  }
  return [];
}

export type Me = {
  signed_in: boolean;
  username?: string | null;
  remember_device?: boolean;
};

export type AppConfig = {
  app_name: string;
  version: string;
  warehouse_url: string;
};

export type WarehouseItem = {
  id: number;
  name: string;
  sku?: string;
  quantity?: number;
  notes?: string | null;
  created_at?: string;
  location?: {
    warehouse?: string;
    section?: string;
    shelf?: string;
    path?: string;
  };
};

export type Task = {
  id: number;
  action: string;
  status: string;
  robot?: string;
  item?: string;
  item_id?: number | null;
  section?: string;
  quantity?: number;
  note?: string;
  staff_username?: string | null;
  store_order_ref?: string;
  store_order_status?: string;
  created_at?: string;
  updated_at?: string;
};

export type Robot = {
  id: number;
  name: string;
  status: string;
  section_name?: string;
  warehouse_name?: string;
  paired?: boolean;
  unit_image?: number;
  unit_brand?: string;
  unit_code?: string;
};

export type Bootstrap = {
  tasks: Task[];
  robots: Robot[];
  items: WarehouseItem[];
  warehouse_connected?: boolean;
  message?: string;
};

export type NotificationItem = {
  id: number;
  kind: string;
  title: string;
  body?: string | null;
  href?: string | null;
  read: boolean;
  read_at?: string | null;
  created_at?: string;
};

export const put = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: "PUT", body: body === undefined ? undefined : JSON.stringify(body) });

export const del = <T>(path: string) => api<T>(path, { method: "DELETE" });
