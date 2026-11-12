import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '@/constants/gym';
import { dateKey, parseKey } from '@/store/gym-store';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function Calendar({ selected, onSelect, marked }: { selected: string; onSelect: (k: string) => void; marked: Record<string, boolean> }) {
  const [cur, setCur] = useState(() => { const d = parseKey(selected); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const y = cur.getFullYear(), m = cur.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7; // week starts Monday
  const cells: (number | null)[] = [...Array(offset).fill(null), ...Array.from({ length: new Date(y, m + 1, 0).getDate() }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const today = dateKey(new Date());
  const go = (n: number) => setCur(new Date(y, m + n, 1));

  return (
    <View style={{ backgroundColor: C.card, borderRadius: 22, padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Pressable onPress={() => go(-1)} hitSlop={12}><Ionicons name="chevron-back" size={22} color={C.yellow} /></Pressable>
        <Text style={{ color: C.text, fontSize: 17, fontWeight: '700' }}>{MONTHS[m]} {y}</Text>
        <Pressable onPress={() => go(1)} hitSlop={12}><Ionicons name="chevron-forward" size={22} color={C.yellow} /></Pressable>
      </View>
      <View style={{ flexDirection: 'row' }}>
        {['M','T','W','T','F','S','S'].map((d, i) => (
          <Text key={i} style={{ width: '14.28%', textAlign: 'center', color: C.muted, fontSize: 12, marginBottom: 6 }}>{d}</Text>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {cells.map((d, i) => {
          if (!d) return <View key={i} style={{ width: '14.28%', height: 42 }} />;
          const k = dateKey(new Date(y, m, d));
          const sel = k === selected;
          return (
            <Pressable key={i} onPress={() => onSelect(k)} style={{ width: '14.28%', height: 42, alignItems: 'center', justifyContent: 'center' }}>
              <View style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: sel ? C.yellow : 'transparent', borderWidth: k === today && !sel ? 1 : 0, borderColor: C.yellow }}>
                <Text style={{ color: sel ? '#000' : C.text, fontWeight: sel ? '800' : '500' }}>{d}</Text>
                {marked[k] && <View style={{ position: 'absolute', bottom: 3, width: 5, height: 5, borderRadius: 3, backgroundColor: sel ? '#000' : C.yellow }} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}