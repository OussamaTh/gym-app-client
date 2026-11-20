import { createAsyncThunk, createSlice, isAnyOf } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import * as Auth from '@/lib/auth';

type AuthState = {
  user: Auth.PublicUser | null;
  status: 'loading' | 'in' | 'out';
  busy: boolean;
  error: string | null;
};
const initialState: AuthState = { user: null, status: 'loading', busy: false, error: null };

export const bootstrap = createAsyncThunk('auth/bootstrap', async () => {
  if (!(await Auth.hasSession())) return null;
  try {
    return await api<Auth.PublicUser>('/profile');
  } catch {
    return null;
  }
});


export const login = createAsyncThunk('auth/login', (a: { email: string; password: string }) =>
  Auth.login(a.email, a.password),
);

export const register = createAsyncThunk(
  'auth/register',
  (a: { email: string; password: string; firstName: string; lastName: string }) =>
    Auth.register(a.email, a.password, a.firstName, a.lastName),
);

export const logout = createAsyncThunk('auth/logout', () => Auth.logout());

export const updateProfile = createAsyncThunk('auth/updateProfile', (a: { firstName: string; lastName: string }) =>
  api<Auth.PublicUser>('/profile', { method: 'PUT', body: JSON.stringify(a) }),
);

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(bootstrap.fulfilled, (s, a) => {
      s.user = a.payload;
      s.status = a.payload ? 'in' : 'out';
    })
      .addCase(bootstrap.rejected, (s) => {
        s.status = 'out';
      })
      .addCase(logout.fulfilled, (s) => {
        s.user = null;
        s.status = 'out';
      })
      .addCase(updateProfile.fulfilled, (s, a) => {
        s.user = a.payload; 
      })
      .addMatcher(isAnyOf(login.pending, register.pending), (s) => {
        s.busy = true;
        s.error = null;
      })
      .addMatcher(isAnyOf(login.fulfilled, register.fulfilled), (s, a) => {
        s.busy = false;
        s.user = a.payload;
        s.status = 'in';
      })
      .addMatcher(isAnyOf(login.rejected, register.rejected), (s, a) => {
        s.busy = false;
        s.error = a.error.message ?? 'Something went wrong. Try again.';
      });
  },
});

export default slice.reducer;