// The context and provider are gone. This file now only holds types and helper functions,
// so calendar.tsx, exercise-card.tsx and the screens keep importing from the same path.

export type Entry = { name: string; weight: string; sets: string; reps: string };
export type PlanItem = { id: string; name: string; variations?: PlanItem[] };
export type Logs = Record<string, Record<string, Entry>>; // date -> plan item id -> values

/** The rows you log for a plan item: its variations if it has any, otherwise itself. */
export const rowsOf = (p: PlanItem): PlanItem[] =>
    p.variations?.length ? p.variations.map((v) => ({ id: v.id, name: `${p.name} – ${v.name}` })) : [{ id: p.id, name: p.name }];

export const num = (s: string) => parseFloat(String(s).replace(',', '.')) || 0;
export const dateKey = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parseKey = (k: string) => new Date(k + 'T00:00:00');

const same = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** Best weight and volume per session for one exercise, oldest first. */
export function history(logs: Logs, name: string) {
    return Object.keys(logs).sort().flatMap((date) => {
        const e = Object.values(logs[date]).find((x) => same(x.name, name));
        if (!e || !num(e.weight)) return [];
        return [{ date, best: num(e.weight), volume: num(e.weight) * (parseInt(e.sets) || 0) * (parseInt(e.reps) || 0) }];
    });
}

/** The most recent entry for an exercise before a given date. */
export function lastEntry(logs: Logs, name: string, before: string): Entry | undefined {
    const dates = Object.keys(logs).filter((d) => d < before).sort().reverse();
    for (const d of dates) {
        const e = Object.values(logs[d]).find((x) => same(x.name, name) && (x.weight || x.sets || x.reps));
        if (e) return e;
    }
}