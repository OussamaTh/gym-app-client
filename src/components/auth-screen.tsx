import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C } from '@/constants/gym';
import { login, register } from '@/store/auth-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const input = {
    backgroundColor: C.card,
    color: C.text,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
} as const;

export default function AuthScreen() {
    const dispatch = useAppDispatch();
    const { busy, error } = useAppSelector((s) => s.auth);
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const submit = () => {
        const e = email.trim();
        if (!e || !password || busy) return;
        dispatch(
            mode === 'login'
                ? login({ email: e, password })
                : register({ email: e, password, firstName: firstName.trim(), lastName: lastName.trim() }),
        );
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                <ScrollView contentContainerStyle={{ padding: 22, paddingTop: 60, gap: 14 }} keyboardShouldPersistTaps="handled">
                    <Text style={{ color: C.yellow, fontSize: 40, fontWeight: '900', letterSpacing: -1 }}>Gym log</Text>
                    <Text style={{ color: C.muted, marginBottom: 10 }}>
                        {mode === 'login' ? 'Log in to continue.' : 'Create your account.'}
                    </Text>

                    {mode === 'register' && (
                        <>
                            <TextInput style={input} value={firstName} onChangeText={setFirstName} placeholder="First name" placeholderTextColor={C.muted} />
                            <TextInput style={input} value={lastName} onChangeText={setLastName} placeholder="Last name" placeholderTextColor={C.muted} />
                        </>
                    )}
                    <TextInput
                        style={input}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Email"
                        placeholderTextColor={C.muted}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={input}
                        value={password}
                        onChangeText={setPassword}
                        placeholder={mode === 'register' ? 'Password (8+ characters)' : 'Password'}
                        placeholderTextColor={C.muted}
                        secureTextEntry
                        autoCapitalize="none"
                        onSubmitEditing={submit}
                    />

                    {error ? <Text style={{ color: C.danger }}>{error}</Text> : null}

                    <Pressable onPress={submit} style={{ backgroundColor: C.yellow, borderRadius: 14, paddingVertical: 14, alignItems: 'center', opacity: busy ? 0.6 : 1 }}>
                        {busy ? <ActivityIndicator color="#000" /> : <Text style={{ color: '#000', fontSize: 16, fontWeight: '800' }}>{mode === 'login' ? 'Log in' : 'Create account'}</Text>}
                    </Pressable>

                    <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ alignItems: 'center', padding: 8 }}>
                        <Text style={{ color: C.yellow, fontWeight: '700' }}>
                            {mode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
                        </Text>
                    </Pressable>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}