import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, Stat } from '@/components/ui';
import { C } from '@/constants/gym';
import { history, num, parseKey, useGym } from '@/store/gym-store';

const short = (k: string) => parseKey(k).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

export default function Progress() {
    const { data } = useGym();
    const names = useMemo(() => {
        const seen = new Map<string, string>();
        Object.values(data.logs).forEach((day) =>
            Object.values(day).forEach((e) => { if (num(e.weight)) seen.set(e.name.trim().toLowerCase(), e.name.trim()); })
        );
        return [...seen.values()];
    }, [data.logs]);
    const [pick, setPick] = useState<string | null>(null);
    const current = pick && names.includes(pick) ? pick : names[0];
    const h = current ? history(data.logs, current) : [];
    const last10 = h.slice(-10);
    const first = h[0]?.best ?? 0;
    const now = h[h.length - 1]?.best ?? 0;
    const diff = now - first;

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
                <Text style={{ color: C.yellow, fontSize: 34, fontWeight: '900', letterSpacing: -1 }}>Progress</Text>
                <Text style={{ color: C.muted, marginBottom: 16 }}>Your best weight per session.</Text>

                {names.length === 0 ? (
                    <Text style={{ color: C.muted }}>Log a workout on the Train tab to see your progress here.</Text>
                ) : (
                    <>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 16 }}>
                            {names.map((n) => {
                                const on = n === current;
                                return (
                                    <Pressable key={n} onPress={() => setPick(n)} style={{ backgroundColor: on ? C.yellow : C.card, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 9 }}>
                                        <Text style={{ color: on ? '#000' : C.text, fontWeight: '700' }}>{n}</Text>
                                    </Pressable>
                                );
                            })}
                        </ScrollView>

                        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                            <Stat label="Best now (kg)" value={String(now)} accent />
                            <Stat label="Since first (kg)" value={`${diff > 0 ? '+' : ''}${diff}`} />
                            <Stat label="Sessions" value={String(h.length)} />
                        </View>

                        <BarChart values={last10.map((x) => x.best)} labels={last10.map((x) => short(x.date))} />

                        <Text style={{ color: C.text, fontSize: 18, fontWeight: '800', marginTop: 22, marginBottom: 10 }}>History</Text>
                        {[...h].reverse().map((x) => (
                            <View key={x.date} style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 8 }}>
                                <Text style={{ color: C.text }}>{short(x.date)}</Text>
                                <Text style={{ color: C.yellow, fontWeight: '800' }}>{x.best} kg</Text>
                            </View>
                        ))}
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}