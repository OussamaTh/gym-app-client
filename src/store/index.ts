import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers, configureStore, createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit';
import authReducer from '@/store/auth-slice';
import planReducer from '@/store/plan-slice';
import trackerReducer, { pushBody, pushLog, resetTracker, setBody, setLog, syncTracker, trackerKey } from '@/store/tracker-slice';

const rootReducer = combineReducers({ auth: authReducer, plan: planReducer, tracker: trackerReducer });
export type RootState = ReturnType<typeof rootReducer>;

const listeners = createListenerMiddleware();

// 1. Save the local copy to the phone after every change to it
listeners.startListening({
    matcher: isAnyOf(setLog, setBody, resetTracker, syncTracker.fulfilled),
    effect: (_action, l) => {
        const state = l.getState() as RootState;
        const userId = state.auth.user?.id;
        if (!userId) return;
        const { logs, body } = state.tracker; // syncError is not saved
        AsyncStorage.setItem(trackerKey(userId), JSON.stringify({ logs, body })).catch(() => { });
    },
});

// 2. Send an edited log to the server 700 ms after you stop typing in that exercise.
//    One timer per exercise and day, so editing two cards quickly loses nothing.
const timers = new Map<string, ReturnType<typeof setTimeout>>();
listeners.startListening({
    actionCreator: setLog,
    effect: ({ payload: { day, id } }, l) => {
        const key = `${day}|${id}`;
        clearTimeout(timers.get(key));
        timers.set(
            key,
            setTimeout(() => {
                timers.delete(key);
                const entry = (l.getState() as RootState).tracker.logs[day]?.[id];
                if (entry) l.dispatch(pushLog({ day, id, entry }));
            }, 700),
        );
    },
});

// 3. Body weight is saved or deleted right away
listeners.startListening({
    actionCreator: setBody,
    effect: ({ payload }, l) => {
        l.dispatch(pushBody({ day: payload.day, kg: payload.kg }));
    },
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefault) => getDefault().prepend(listeners.middleware),
});

export type AppDispatch = typeof store.dispatch;