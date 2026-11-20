import { authFetch } from '@/lib/auth';

/** Calls the backend with the token attached. Returns parsed JSON, or undefined for 204. Throws Error(message) on failure. */
export async function api<T = unknown>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await authFetch(path, init);
    if (res.status === 204) return undefined as T;
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) {
        const msg = Array.isArray(json.message) ? json.message[0] : json.message;
        throw new Error(msg ?? `Request failed (${res.status})`);
    }
    return json as T;
}