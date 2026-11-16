// Put this file at src/lib/auth.ts in the Expo app.
// Install first: npx expo install expo-secure-store
import * as SecureStore from 'expo-secure-store';

// .env in the Expo project: EXPO_PUBLIC_API_URL=http://192.168.11.105:3000/api/v1
const API = process.env.EXPO_PUBLIC_API_URL;

const ACCESS = 'gym-access-token';
const REFRESH = 'gym-refresh-token';

export type PublicUser = { id: string; email: string; firstName: string; lastName: string };
type AuthResult = { user: PublicUser; accessToken: string; refreshToken: string };

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}

async function saveTokens(access: string, refresh: string) {
  await SecureStore.setItemAsync(ACCESS, access);
  await SecureStore.setItemAsync(REFRESH, refresh);
}

export async function clearTokens() {
  await SecureStore.deleteItemAsync(ACCESS);
  await SecureStore.deleteItemAsync(REFRESH);
}

export async function hasSession() {
  return !!(await SecureStore.getItemAsync(REFRESH));
}

async function post<T>(path: string, body: object): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = Array.isArray(json.message) ? json.message[0] : json.message;
    throw new ApiError(msg ?? 'Something went wrong. Try again.', res.status);
  }
  return json as T;
}

export async function register(email: string, password: string, firstName = '', lastName = '') {
  const r = await post<AuthResult>('/auth/register', { email, password, firstName, lastName });
  await saveTokens(r.accessToken, r.refreshToken);
  return r.user;
}

export async function login(email: string, password: string) {
  const r = await post<AuthResult>('/auth/login', { email, password });
  await saveTokens(r.accessToken, r.refreshToken);
  return r.user;
}

export async function logout() {
  try {
    await authFetch('/auth/logout', { method: 'POST' });
  } catch {} // no signal: still log out on this phone
  await clearTokens();
}

// Several requests can fail at once with 401. They all share one refresh call.
let refreshing: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const refreshToken = await SecureStore.getItemAsync(REFRESH);
      if (!refreshToken) return false;
      const r = await post<AuthResult>('/auth/refresh', { refreshToken });
      await saveTokens(r.accessToken, r.refreshToken);
      return true;
    } catch (e) {
      // Only end the session if the server rejected the token.
      // With no signal (a network error) keep it, so the gym basement does not log you out.
      if (e instanceof ApiError && e.status === 401) await clearTokens();
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

/** fetch() with the access token attached. On 401 it refreshes once and retries. */
export async function authFetch(path: string, init: RequestInit = {}) {
  const run = async () =>
    fetch(`${API}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers as Record<string, string>),
        Authorization: `Bearer ${await SecureStore.getItemAsync(ACCESS)}`,
      },
    });

  let res = await run();
  if (res.status === 401 && (await refreshTokens())) res = await run();
  return res;
}