import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { C } from '@/constants/gym';
import { Entry } from '@/store/gym-store';

const FIELDS: { key: 'weight' | 'sets' | 'reps'; label: string; kb: 'decimal-pad' | 'number-pad' }[] = [
    { key: 'weight', label: 'Weight (kg)', kb: 'decimal-pad' },
    { key: 'sets', label: 'Sets', kb: 'number-pad' },
    { key: 'reps', label: 'Reps', kb: 'number-pad' },
];

export function ExerciseCard({ name, value, last, onChange }: { name: string; value?: Entry; last?: Entry; onChange: (patch: Partial<Entry>) => void }) {
    return (
        <View style={{ backgroundColor: C.card, borderRadius: 22, padding: 16, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: C.yellow }}>
            <Text style={{ color: C.text, fontSize: 18, fontWeight: '800' }}>{name}</Text>
            {last ? (
                <Text style={{ color: C.yellow, fontSize: 12, marginTop: 2 }}>
                    Last time: {last.weight || '0'} kg, {last.sets || '0'} × {last.reps || '0'}
                </Text>
            ) : null}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                {FIELDS.map((f) => (
                    <View key={f.key} style={{ flex: 1 }}>
                        <Text style={{ color: C.muted, fontSize: 12, marginBottom: 6, textAlign: 'center' }}>{f.label}</Text>
                        <TextInput
                            value={value?.[f.key] ?? ''}
                            keyboardType={f.kb}
                            placeholder={last?.[f.key] || '0'}
                            placeholderTextColor="#555"
                            onChangeText={(v) => onChange({ [f.key]: v.replace(/[^0-9.,]/g, '') })}
                            style={{ backgroundColor: C.card2, color: C.text, borderRadius: 12, paddingVertical: 10, textAlign: 'center', fontSize: 18, fontWeight: '800' }}
                        />
                    </View>
                ))}
            </View>
        </View>
    );
}