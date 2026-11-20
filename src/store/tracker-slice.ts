import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice, isAnyOf, PayloadAction } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { logout } from '@/store/auth-slice';
import { Entry, Logs } from '@/store/gym-store';

// Logs and body weight: a copy on the phone (works offline) that is synced with the backend.
type TrackerState = { logs: Logs; body: Record<string, number>; syncError: string | null };
const initialState: TrackerState = { logs: {}, body: {}, syncError: null };

type ServerLog = { name: string; weight: number | null; sets: number | null; reps: number | null };
type ServerLogs = Record<string, Record<string, ServerLog>>;

// One storage key per user, so two accounts on the same phone never see each other's data
export const trackerKey = (userId: string) => `gym-tracker-${userId}`;

// The app keeps text from the inputs, the server stores numbers. Empty text becomes null.
const toNum = (s: string, int = false) => {
  const n = int ? parseInt(s, 10) : parseFloat(s.replace(',', '.'));
  return Number.isFinite(n) ? n : null;
};
const toServer = (day: string, id: string, e: Entry) => ({
  date: day,
  planItemId: id,
  name: e.name,
  weight: toNum(e.weight),
  sets: toNum(e.sets, true),
  reps: toNum(e.reps, true),
});
const fromServer = (s: ServerLog): Entry => ({
  name: s.name,
  weight: s.weight == null ? '' : String(s.weight),
  sets: s.sets == null ? '' : String(s.sets),
  reps: s.reps == null ? '' : String(s.reps),
});
const hasValue = (e: Entry) => !!(e.weight || e.sets || e.reps);
const chunk = <T>(a: T[], n: number) =>
  Array.from({ length: Math.ceil(a.length / n) }, (_, i) => a.slice(i * n, i * n + n));

/** Reads the copy saved on the phone for this user. */
export const loadTracker = createAsyncThunk('tracker/load', async (userId: string): Promise<TrackerState> => {
  const raw = await AsyncStorage.getItem(trackerKey(userId));
  return raw ? { ...initialState, ...JSON.parse(raw), syncError: null } : initialState;
});

/**
 * Runs after login, once the local copy is loaded:
 * 1. downloads everything from the server,
 * 2. uploads entries that exist only on the phone (made offline, or before the backend existed),
 * 3. merges: where both have the same entry, the server's version wins.
 */
export const syncTracker = createAsyncThunk('tracker/sync', async (_: void, { getState }) => {
  const [serverLogs, serverBody] = await Promise.all([
    api<ServerLogs>('/logs'),
    api<Record<string, number>>('/body-weight'),
  ]);
  const local = (getState() as { tracker: TrackerState }).tracker;

  const logUploads: ReturnType<typeof toServer>[] = [];
  for (const [day, items] of Object.entries(local.logs)) {
    for (const [id, entry] of Object.entries(items)) {
      if (!serverLogs[day]?.[id] && hasValue(entry)) logUploads.push(toServer(day, id, entry));
    }
  }
  const bodyUploads = Object.entries(local.body).filter(([day]) => serverBody[day] === undefined);

  await Promise.all([
    ...chunk(logUploads, 200).map((entries) => api('/logs', { method: 'PUT', body: JSON.stringify({ entries }) })),
    ...bodyUploads.map(([day, kg]) => api(`/body-weight/${day}`, { method: 'PUT', body: JSON.stringify({ kg }) })),
  ]);

  const logs: Logs = JSON.parse(JSON.stringify(local.logs));
  for (const [day, items] of Object.entries(serverLogs)) {
    for (const [id, s] of Object.entries(items)) (logs[day] ??= {})[id] = fromServer(s);
  }
  return { logs, body: { ...local.body, ...serverBody } };
});

/** Sends one edited entry. Called a moment after you stop typing (see store/index.ts). */
export const pushLog = createAsyncThunk('tracker/pushLog', async (a: { day: string; id: string; entry: Entry }) => {
  await api('/logs', { method: 'PUT', body: JSON.stringify({ entries: [toServer(a.day, a.id, a.entry)] }) });
});

export const pushBody = createAsyncThunk('tracker/pushBody', async (a: { day: string; kg: number | null }) => {
  if (a.kg == null) await api(`/body-weight/${a.day}`, { method: 'DELETE' });
  else await api(`/body-weight/${a.day}`, { method: 'PUT', body: JSON.stringify({ kg: Math.round(a.kg * 100) / 100 }) });
});

/** Used by "Reset all data": deletes every log and weigh-in on the server. */
export const clearServerTracker = createAsyncThunk('tracker/clearServer', async () => {
  await Promise.all([api('/logs', { method: 'DELETE' }), api('/body-weight', { method: 'DELETE' })]);
});

const slice = createSlice({
  name: 'tracker',
  initialState,
  reducers: {
    setLog(s, a: PayloadAction<{ day: string; id: string; name: string; patch: Partial<Entry> }>) {
      const { day, id, name, patch } = a.payload;
      const cur = s.logs[day]?.[id] ?? { name, weight: '', sets: '', reps: '' };
      (s.logs[day] ??= {})[id] = { ...cur, ...patch, name };
    },
    setBody(s, a: PayloadAction<{ day: string; kg: number | null }>) {
      if (a.payload.kg == null) delete s.body[a.payload.day];
      else s.body[a.payload.day] = a.payload.kg;
    },
    resetTracker: () => initialState,
  },
  extraReducers: (b) => {
    b.addCase(loadTracker.fulfilled, (_s, a) => a.payload)
      .addCase(syncTracker.fulfilled, (s, a) => {
        s.logs = a.payload.logs;
        s.body = a.payload.body;
      })
      .addCase(logout.fulfilled, () => initialState)
      .addMatcher(isAnyOf(syncTracker.fulfilled, pushLog.fulfilled, pushBody.fulfilled), (s) => {
        s.syncError = null;
      })
      .addMatcher(
        isAnyOf(syncTracker.rejected, pushLog.rejected, pushBody.rejected, clearServerTracker.rejected),
        (s, a) => {
          s.syncError = a.error.message ?? 'Sync failed';
        },
      );
  },
});

export const { setLog, setBody, resetTracker } = slice.actions;
export default slice.reducer;