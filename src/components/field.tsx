import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { C } from '@/constants/gym';

type Props = {
    label: string;
    value: string;
    onChangeText: (v: string) => void;
    placeholder: string;
    keyboardType?: 'default' | 'numeric' | 'decimal-pad';
};

export default function Field({ label, value, onChangeText, placeholder, keyboardType }: Props) {
    return (
        <View style={{ width: '100%' }}>
            <Text style={{ color: C.text, fontSize: 15, fontWeight: '600', paddingBottom: 8, paddingLeft: 4 }}>
                {label}
            </Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={C.muted}
                keyboardType={keyboardType}
                autoCapitalize="words"
                style={{ backgroundColor: C.card, color: C.text, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 }}
            />
        </View>
    );
}