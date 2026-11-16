import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { C } from '@/constants/gym';
import { Entry, PlanItem, rowsOf } from '@/store/gym-store';

const FIELDS: { key: 'weight' | 'sets' | 'reps'; label: string; kb: 'decimal-pad' | 'number-pad' }[] = [
    { key: 'weight', label: 'Weight (kg)', kb: 'decimal-pad' },
    { key: 'sets', label: 'Sets', kb: 'number-pad' },
    { key: 'reps', label: 'Reps', kb: 'number-pad' },
];

function Row({ title, last, value, onChange, onRemove }: {
    title?: string; last?: Entry; value?: Entry; onChange: (patch: Partial<Entry>) => void; onRemove?: () => void;
}) {
    return (
        <View style={{ marginTop: 12 }}>
            {title ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: C.text, fontSize: 15, fontWeight: '700' }}>{title}</Text>
                    <Pressable onPress={onRemove} hitSlop={10}>
                        <Ionicons name="close-circle" size={20} color={C.muted} />
                    </Pressable>
                </View>
            ) : null}
            {last ? (
                <Text style={{ color: C.yellow, fontSize: 12, marginTop: 2 }}>
                    Last time: {last.weight || '0'} kg, {last.sets || '0'} × {last.reps || '0'}
                </Text>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
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

export function ExerciseCard({ item, entries, lastFor, onChange, onAddVariation, onRemoveVariation }: {
    item: PlanItem;
    entries: Record<string, Entry>;
    lastFor: (name: string) => Entry | undefined;
    onChange: (target: PlanItem, patch: Partial<Entry>) => void;
    onAddVariation: (name: string) => void;
    onRemoveVariation: (id: string) => void;
}) {
    const [adding, setAdding] = useState(false);
    const [text, setText] = useState('');
    const hasVars = !!item.variations?.length;

    const submit = () => {
        const t = text.trim();
        if (!t) return;
        onAddVariation(t);
        setText('');
        setAdding(false);
    };

    return (
        <View style={{ backgroundColor: C.card, borderRadius: 22, padding: 16, marginBottom: 14, borderLeftWidth: 4, borderLeftColor: C.yellow }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                <Text style={{ color: C.text, fontSize: 18, fontWeight: '800', flex: 1 }}>{item.name}</Text>
                <Pressable onPress={() => setAdding((a) => !a)} style={{ backgroundColor: C.yellowDim, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 }}>
                    <Text style={{ color: C.yellow, fontWeight: '700' }}>{adding ? 'Cancel' : 'Add variation'}</Text>
                </Pressable>
            </View>

            {adding && (
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 12 }}>
                    <TextInput
                        value={text}
                        onChangeText={setText}
                        onSubmitEditing={submit}
                        autoFocus
                        placeholder="e.g. Bottom, Top, Cable"
                        placeholderTextColor={C.muted}
                        style={{ flex: 1, backgroundColor: C.card2, color: C.text, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 15 }}
                    />
                    <Pressable onPress={submit} style={{ backgroundColor: C.yellow, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}>
                        <Text style={{ color: '#000', fontWeight: '800' }}>Add</Text>
                    </Pressable>
                </View>
            )}

            {rowsOf(item).map((r, i) => (
                <Row
                    key={r.id}
                    title={hasVars ? item.variations![i].name : undefined}
                    last={lastFor(r.name)}
                    value={entries[r.id]}
                    onChange={(patch) => onChange(r, patch)}
                    onRemove={hasVars ? () => onRemoveVariation(r.id) : undefined}
                />
            ))}
        </View>
    );
}