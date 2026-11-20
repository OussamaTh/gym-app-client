import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { PlanItem } from '@/store/gym-store';
import { logout } from '@/store/auth-slice';

type ServerItem = { id: string; weekday: number; name: string; position: number; variations: { id: string; name: string }[] };
const toItem = (s: ServerItem): PlanItem => ({ id: s.id, name: s.name, variations: s.variations });

type PlanState = { byDay: Record<number, PlanItem[]>; loading: boolean; error: string | null };
const initialState: PlanState = { byDay: {}, loading: false, error: null };

export const fetchPlans = createAsyncThunk('plan/fetch', async () => {
  const data = await api<Record<string, ServerItem[]>>('/plan');
  const byDay: Record<number, PlanItem[]> = {};
  for (const [weekday, items] of Object.entries(data)) byDay[Number(weekday)] = items.map(toItem);
  return byDay;
});

export const addPlan = createAsyncThunk('plan/add', async (a: { weekday: number; name: string }) => {
  const item = await api<ServerItem>('/plan', { method: 'POST', body: JSON.stringify(a) });
  return { weekday: a.weekday, item: toItem(item) };
});

export const removePlan = createAsyncThunk('plan/remove', async (a: { weekday: number; id: string }) => {
  await api(`/plan/${a.id}`, { method: 'DELETE' });
  return a;
});

export const addVariation = createAsyncThunk(
  'plan/addVariation',
  async (a: { weekday: number; planId: string; name: string }) => {
    const item = await api<ServerItem>(`/plan/${a.planId}/variations`, {
      method: 'POST',
      body: JSON.stringify({ name: a.name }),
    });
    return { weekday: a.weekday, item: toItem(item) };
  },
);

export const removeVariation = createAsyncThunk(
  'plan/removeVariation',
  async (a: { weekday: number; planId: string; varId: string }) => {
    await api(`/plan/${a.planId}/variations/${a.varId}`, { method: 'DELETE' });
    return a;
  },
);

/** Used by "Reset all data": deletes every plan item on the server. */
export const resetPlan = createAsyncThunk('plan/reset', async (ids: string[]) => {
  await Promise.all(ids.map((id) => api(`/plan/${id}`, { method: 'DELETE' })));
});

const slice = createSlice({
  name: 'plan',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchPlans.pending, (s) => {
      s.loading = true;
    })
      .addCase(fetchPlans.fulfilled, (s, a) => {
        s.loading = false;
        s.byDay = a.payload;
      })
      .addCase(addPlan.fulfilled, (s, { payload: { weekday, item } }) => {
        s.byDay[weekday] = [...(s.byDay[weekday] ?? []), item];
      })
      .addCase(removePlan.fulfilled, (s, { payload: { weekday, id } }) => {
        s.byDay[weekday] = (s.byDay[weekday] ?? []).filter((p) => p.id !== id);
      })
      .addCase(addVariation.fulfilled, (s, { payload: { weekday, item } }) => {
        s.byDay[weekday] = (s.byDay[weekday] ?? []).map((p) => (p.id === item.id ? item : p));
      })
      .addCase(removeVariation.fulfilled, (s, { payload: { weekday, planId, varId } }) => {
        s.byDay[weekday] = (s.byDay[weekday] ?? []).map((p) =>
          p.id === planId ? { ...p, variations: (p.variations ?? []).filter((v) => v.id !== varId) } : p,
        );
      })
      .addCase(resetPlan.fulfilled, (s) => {
        s.byDay = {};
      })
      .addCase(logout.fulfilled, () => initialState)
      .addMatcher(
        isAnyOf(fetchPlans.rejected, addPlan.rejected, removePlan.rejected, addVariation.rejected, removeVariation.rejected, resetPlan.rejected),
        (s, a) => {
          s.loading = false;
          s.error = a.error.message ?? 'Request failed';
        },
      )
      .addMatcher(
        isAnyOf(fetchPlans.pending, addPlan.pending, removePlan.pending, addVariation.pending, removeVariation.pending, resetPlan.pending),
        (s) => {
          s.error = null;
        },
      );
  },
});

export default slice.reducer;