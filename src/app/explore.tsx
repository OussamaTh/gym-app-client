import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart, Stat } from '@/components/ui';
import { C } from '@/constants/gym';
import { dateKey, num, parseKey, useGym } from '@/store/gym-store';

const short = (k: string) => parseKey(k).toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

export default function Body() {
  const { data, setBody } = useGym();
  const [date, setDate] = useState(dateKey(new Date()));
  const [value, setValue] = useState('');
  const entries = Object.keys(data.body).sort();
  const last14 = entries.slice(-14);
  const now = entries.length ? data.body[entries[entries.length - 1]] : 0;
  const change = entries.length ? +(now - data.body[entries[0]]).toFixed(1) : 0;

  const save = () => {
    const kg = num(value);
    if (!kg) return;
    setBody(date, kg);
    setValue('');
    setDate(dateKey(new Date()));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Text style={{ color: C.yellow, fontSize: 34, fontWeight: '900', letterSpacing: -1 }}>Body weight</Text>
        <Text style={{ color: C.muted, marginBottom: 16 }}>Weigh in and watch the trend.</Text>

        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
          <Stat label="Current (kg)" value={entries.length ? String(now) : '-'} accent />
          <Stat label="Change (kg)" value={`${change > 0 ? '+' : ''}${change}`} />
          <Stat label="Weigh-ins" value={String(entries.length)} />
        </View>

        <View style={{ backgroundColor: C.card, borderRadius: 22, padding: 16, marginBottom: 16 }}>
          <Text style={{ color: C.text, fontWeight: '800', marginBottom: 10 }}>
            {date === dateKey(new Date()) ? 'Today' : `Editing ${short(date)}`}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TextInput
              value={value}
              onChangeText={(v) => setValue(v.replace(/[^0-9.,]/g, ''))}
              keyboardType="decimal-pad"
              placeholder="Weight in kg"
              placeholderTextColor={C.muted}
              style={{ flex: 1, backgroundColor: C.card2, color: C.text, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 18, fontWeight: '700' }}
            />
            <Pressable onPress={save} style={{ backgroundColor: C.yellow, borderRadius: 14, paddingHorizontal: 20, justifyContent: 'center' }}>
              <Text style={{ color: '#000', fontWeight: '800' }}>Save</Text>
            </Pressable>
          </View>
        </View>

        <BarChart values={last14.map((k) => data.body[k])} labels={last14.map(short)} floor />

        <Text style={{ color: C.text, fontSize: 18, fontWeight: '800', marginTop: 22, marginBottom: 10 }}>Entries</Text>
        {entries.length === 0 && <Text style={{ color: C.muted }}>No weigh-ins yet. Add your first one above.</Text>}
        {[...entries].reverse().map((k) => (
          <Pressable
            key={k}
            onPress={() => { setDate(k); setValue(String(data.body[k])); }}
            style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 8, borderWidth: k === date ? 1 : 0, borderColor: C.yellow }}>
            <Text style={{ color: C.text, flex: 1 }}>{short(k)}</Text>
            <Text style={{ color: C.yellow, fontWeight: '800', marginRight: 16 }}>{data.body[k]} kg</Text>
            <Pressable onPress={() => setBody(k, null)} hitSlop={10}><Ionicons name="trash-outline" size={18} color={C.danger} /></Pressable>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}