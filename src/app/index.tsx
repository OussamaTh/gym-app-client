import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from '@/components/calendar';
import { ExerciseCard } from '@/components/exercise-card';
import { Stat } from '@/components/ui';
import { C, COMMON_EXERCISES } from '@/constants/gym';
import { dateKey, lastEntry, num, parseKey, useGym } from '@/store/gym-store';

export default function Train() {
  const { data, addPlan, removePlan, setLog } = useGym();
  const [day, setSelected] = useState(dateKey(new Date()));
  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);

  const date = parseKey(day);
  const weekday = date.getDay();
  const weekdayName = date.toLocaleDateString('en-US', { weekday: 'long' });
  const plan = data.plan[weekday] ?? [];
  const entries = data.logs[day] ?? {};
  const marked = useMemo(() => Object.fromEntries(Object.keys(data.logs).map((k) => [k, true])), [data.logs]);

  const sets = plan.reduce((a, p) => a + (parseInt(entries[p.id]?.sets) || 0), 0);
  const volume = plan.reduce((a, p) => {
    const e = entries[p.id];
    return a + (e ? num(e.weight) * (parseInt(e.sets) || 0) * (parseInt(e.reps) || 0) : 0);
  }, 0);

  const add = (n: string) => {
    const t = n.trim();
    if (!t) return;
    addPlan(weekday, t);
    setName('');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
          <Text style={{ color: C.yellow, fontSize: 34, fontWeight: '900', letterSpacing: -1 }}>GYM</Text>
          <Text style={{ color: C.muted, marginBottom: 16 }}>Lifted Weight Progress</Text>

          <Calendar selected={day} onSelect={(k) => { setSelected(k); setEditing(false); }} marked={marked} />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 22, marginBottom: 12 }}>
            <Text style={{ color: C.text, fontSize: 20, fontWeight: '800' }}>
              {date.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <Pressable
              onPress={() => setEditing((e) => !e)}
              style={{ backgroundColor: editing ? C.yellow : C.yellowDim, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 7 }}>
              <Text style={{ color: editing ? '#000' : C.yellow, fontWeight: '700' }}>{editing ? 'Done' : 'Edit plan'}</Text>
            </Pressable>
          </View>

          {editing ? (
            <>
              <Text style={{ color: C.muted, marginBottom: 12 }}>
                Exercises you add here repeat every {weekdayName}.
              </Text>
              {plan.map((p) => (
                <View key={p.id} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: C.card, borderRadius: 14, padding: 14, marginBottom: 8 }}>
                  <Text style={{ color: C.text, fontWeight: '700', flex: 1 }}>{p.name}</Text>
                  <Pressable onPress={() => removePlan(weekday, p.id)} hitSlop={10}>
                    <Ionicons name="trash-outline" size={20} color={C.danger} />
                  </Pressable>
                </View>
              ))}

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  onSubmitEditing={() => add(name)}
                  placeholder="Exercise name, e.g. Bench press"
                  placeholderTextColor={C.muted}
                  style={{ flex: 1, backgroundColor: C.card, color: C.text, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 }}
                />
                <Pressable onPress={() => add(name)} style={{ backgroundColor: C.yellow, borderRadius: 14, width: 50, alignItems: 'center', justifyContent: 'center' }}>
                  <Ionicons name="add" size={26} color="#000" />
                </Pressable>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }} contentContainerStyle={{ gap: 8 }}>
                {COMMON_EXERCISES.map((n) => (
                  <Pressable key={n} onPress={() => add(n)} style={{ backgroundColor: C.yellowDim, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 }}>
                    <Text style={{ color: C.yellow, fontWeight: '600' }}>{n}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </>
          ) : (
            <>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                <Stat label="Exercises" value={String(plan.length)} />
                <Stat label="Sets" value={String(sets)} accent />
              </View>

              {plan.length === 0 && (
                <Text style={{ color: C.muted }}>
                  No exercises planned for {weekdayName}. Tap Edit plan to add some.
                </Text>
              )}

              {plan.map((p) => (
                <ExerciseCard
                  key={p.id}
                  name={p.name}
                  value={entries[p.id]}
                  last={lastEntry(data.logs, p.name, day)}
                  onChange={(patch) => setLog(day, p, patch)}
                />
              ))}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}