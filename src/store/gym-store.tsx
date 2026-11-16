import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Entry = { name: string; weight: string; sets: string; reps: string };
export type PlanItem = { id: string; name: string; variations?: PlanItem[] };

/** The rows you log for a plan item: its variations if it has any, otherwise itself. */
export const rowsOf = (p: PlanItem): PlanItem[] =>
    p.variations?.length ? p.variations.map((v) => ({ id: v.id, name: `${p.name} – ${v.name}` })) : [{ id: p.id, name: p.name }];
type Data = {
    plan: Record<number, PlanItem[]>;
    logs: Record<string, Record<string, Entry>>;
    body: Record<string, number>;
};
const KEY = 'gym-app-v2';

export const uid = () => Math.random().toString(36).slice(2, 9);
export const num = (s: string) => parseFloat(String(s).replace(',', '.')) || 0;
export const dateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseKey = (k: string) => new Date(k + 'T00:00:00');

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Best weight and volume per session for one exercise, oldest first. */
export function history(logs: Data['logs'], name: string) {
    return Object.keys(logs).sort().flatMap((date) => {
        const e = Object.values(logs[date]).find((x) => same(x.name, name));
        if (!e || !num(e.weight)) return [];
        return [{ date, best: num(e.weight), volume: num(e.weight) * (parseInt(e.sets) || 0) * (parseInt(e.reps) || 0) }];
    });
}

/** The most recent entry for an exercise before a given date. */
export function lastEntry(logs: Data['logs'], name: string, before: string): Entry | undefined {
    const dates = Object.keys(logs).filter((d) => d < before).sort().reverse();
    for (const d of dates) {
        const e = Object.values(logs[d]).find((x) => same(x.name, name) && (x.weight || x.sets || x.reps));
        if (e) return e;
    }
}

type Ctx = {
    data: Data;
    ready: boolean;
    addPlan: (weekday: number, name: string) => void;
    removePlan: (weekday: number, id: string) => void;
    setLog: (day: string, item: PlanItem, patch: Partial<Entry>) => void;
    setBody: (day: string, kg: number | null) => void;
    resetAll: () => void;
    addVariation: (weekday: number, planId: string, name: string) => void;
    removeVariation: (weekday: number, planId: string, varId: string) => void;

};
const GymCtx = createContext<Ctx>(null as any);

export function GymProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<Data>({ plan: {}, logs: {}, body: {} });
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let data = AsyncStorage.getItem(KEY)
            .then((v) => v && setData({ plan: {}, logs: {}, body: {}, ...JSON.parse(v) }))
            .catch(() => { })
            .finally(() => setReady(true));
        console.log(data)
    }, []);

    useEffect(() => {
        if (ready) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => { });
    }, [data, ready]);

    const addPlan: Ctx['addPlan'] = (wd, name) =>
        setData((d) => ({ ...d, plan: { ...d.plan, [wd]: [...(d.plan[wd] ?? []), { id: uid(), name }] } }));

    const removePlan: Ctx['removePlan'] = (wd, id) =>
        setData((d) => ({ ...d, plan: { ...d.plan, [wd]: (d.plan[wd] ?? []).filter((x) => x.id !== id) } }));

    const addVariation: Ctx['addVariation'] = (wd, planId, name) =>
        setData((d) => ({
            ...d,
            plan: {
                ...d.plan,
                [wd]: (d.plan[wd] ?? []).map((p) =>
                    p.id === planId ? { ...p, variations: [...(p.variations ?? []), { id: uid(), name }] } : p
                ),
            },
        }));

    const removeVariation: Ctx['removeVariation'] = (wd, planId, varId) =>
        setData((d) => ({
            ...d,
            plan: {
                ...d.plan,
                [wd]: (d.plan[wd] ?? []).map((p) =>
                    p.id === planId ? { ...p, variations: (p.variations ?? []).filter((v) => v.id !== varId) } : p
                ),
            },
        }));

    const setLog: Ctx['setLog'] = (day, item, patch) =>
        setData((d) => {
            const cur = d.logs[day]?.[item.id] ?? { name: item.name, weight: '', sets: '', reps: '' };

            console.log({ ...d, logs: { ...d.logs, [day]: { ...d.logs[day], [item.id]: { ...cur, ...patch, name: item.name } } } })

            return { ...d, logs: { ...d.logs, [day]: { ...d.logs[day], [item.id]: { ...cur, ...patch, name: item.name } } } };
        });

    const setBody: Ctx['setBody'] = (day, kg) =>
        setData((d) => {
            const body = { ...d.body };
            if (kg == null) delete body[day]; else body[day] = kg;
            return { ...d, body };
        });

    const resetAll: Ctx['resetAll'] = () => setData({ plan: {}, logs: {}, body: {} });

    return <GymCtx.Provider value={{ data, ready, addPlan, removePlan, addVariation, removeVariation, setLog, setBody, resetAll }}>{children}</GymCtx.Provider>;
}

export const useGym = () => useContext(GymCtx);