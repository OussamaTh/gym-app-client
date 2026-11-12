import React from 'react';
import { Text, View } from 'react-native';
import { C } from '@/constants/gym';

export function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={{ flex: 1, backgroundColor: accent ? C.yellow : C.card, borderRadius: 18, padding: 14 }}>
      <Text style={{ color: accent ? '#000' : C.muted, fontSize: 12 }}>{label}</Text>
      <Text style={{ color: accent ? '#000' : C.text, fontSize: 22, fontWeight: '800', marginTop: 4 }}>{value}</Text>
    </View>
  );
}

/** Simple bar chart drawn with Views. `floor` keeps small changes visible (e.g. body weight). */
export function BarChart({ values, labels, floor }: { values: number[]; labels: string[]; floor?: boolean }) {
  if (!values.length) return null;
  const max = Math.max(...values);
  const min = floor ? Math.min(...values) - 1 : 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 170, gap: 6, backgroundColor: C.card, borderRadius: 18, padding: 14 }}>
      {values.map((v, i) => {
        const h = 0.12 + 0.88 * ((v - min) / (max - min || 1));
        const last = i === values.length - 1;
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            <Text style={{ color: last ? C.yellow : C.muted, fontSize: 10, marginBottom: 3 }}>{v}</Text>
            <View style={{ width: '100%', height: `${h * 72}%`, borderRadius: 6, backgroundColor: last ? C.yellow : C.yellowDim, borderWidth: last ? 0 : 1, borderColor: C.yellow }} />
            <Text style={{ color: C.muted, fontSize: 9, marginTop: 4 }}>{labels[i]}</Text>
          </View>
        );
      })}
    </View>
  );
}