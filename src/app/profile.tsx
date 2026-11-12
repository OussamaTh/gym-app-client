import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Field from '@/components/field';
import { C } from '@/constants/gym';
import { useGym } from '@/store/gym-store';

const KEY = 'gym-profile-v1';
type ProfileData = { firstName: string; lastName: string };
const EMPTY: ProfileData = { firstName: '', lastName: '' };

export default function Profile() {
    const { resetAll } = useGym();
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [saved, setSaved] = useState<ProfileData>(EMPTY);
    const [status, setStatus] = useState('');

    // Load the saved profile when the screen opens
    useEffect(() => {
        AsyncStorage.getItem(KEY)
            .then((v) => {
                if (!v) return;
                const p: ProfileData = { ...EMPTY, ...JSON.parse(v) };
                setSaved(p);
                setFirstName(p.firstName);
                setLastName(p.lastName);
            })
            .catch(() => { });
    }, []);

    const submit = async () => {
        const next = { firstName: firstName.trim(), lastName: lastName.trim() };
        if (!next.firstName) {
            setStatus('Enter your first name to save.');
            return;
        }
        try {
            await AsyncStorage.setItem(KEY, JSON.stringify(next));
            setFirstName(next.firstName);
            setLastName(next.lastName);
            setSaved(next);
            setStatus('Profile saved.');
        } catch {
            setStatus('Could not save your profile. Try again.');
        }
    };

    const reset = () =>
        Alert.alert(
            'Reset all app data?',
            'This permanently deletes your profile, workout plan, logged weights, and body weight entries from this phone. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete everything',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await AsyncStorage.removeItem(KEY);
                        } catch { }
                        resetAll();
                        setFirstName('');
                        setLastName('');
                        setSaved(EMPTY);
                        setStatus('All app data was reset.');
                    },
                },
            ]
        );

    const fullName = `${saved.firstName} ${saved.lastName}`.trim();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
            <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
                <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
                    <Text style={{ color: C.yellow, fontSize: 34, fontWeight: '900', letterSpacing: -1 }}>Profile</Text>
                    <Text style={{ color: C.muted, marginBottom: 16 }}>Your personal info</Text>

                    <View style={{ width: '100%', flexDirection: 'column', alignItems: 'center', padding: 20, gap: 20 }}>
                        <View style={{ backgroundColor: C.card, width: 120, height: 120, borderRadius: 60, borderColor: C.line, borderWidth: 3, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="person" size={56} color={C.muted} />
                        </View>

                        <Text style={{ color: fullName ? C.text : C.muted, fontSize: 25, fontWeight: '800' }}>
                            {fullName || 'Your name'}
                        </Text>

                        <View style={{ width: '100%', gap: 16 }}>
                            <Field label="First name" value={firstName} onChangeText={setFirstName} placeholder="Enter your first name" />
                            <Field label="Last name" value={lastName} onChangeText={setLastName} placeholder="Enter your last name" />
                        </View>

                        {status ? <Text style={{ color: C.muted }}>{status}</Text> : null}

                        <View style={{ width: '100%', gap: 12 }}>
                            <Pressable onPress={submit} style={{ backgroundColor: C.yellow, borderRadius: 14, paddingVertical: 14, alignItems: 'center' }}>
                                <Text style={{ color: '#000', fontSize: 16, fontWeight: '800' }}>Save profile</Text>
                            </Pressable>
                            <Pressable onPress={reset} style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: C.danger }}>
                                <Text style={{ color: C.danger, fontSize: 16, fontWeight: '800' }}>Reset all data</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}