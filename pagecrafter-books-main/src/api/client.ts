/**
 * REST client. Set VITE_BACKEND_URL to point at your backend.
 * When unset, API functions fall back to local mock data.
 */
export const API_BASE_URL: string = (import.meta.env["VITE_BACKEND_URL"] as string | undefined) ?? "";

export const hasBackend = () => API_BASE_URL.length > 0;

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL.replace(/\/$/, "")}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  return res.json() as Promise<T>;
}
