import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Field from '@/components/field';
import { C } from '@/constants/gym';
import { logout, updateProfile } from '@/store/auth-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { resetPlan } from '@/store/plan-slice';
import { clearServerTracker, resetTracker } from '@/store/tracker-slice';

export default function Profile() {
    const dispatch = useAppDispatch();
    const byDay = useAppSelector((s) => s.plan.byDay);
    const user = useAppSelector((s) => s.auth.user);

    const [firstName, setFirstName] = useState(user?.firstName ?? '');
    const [lastName, setLastName] = useState(user?.lastName ?? '');
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState('');

    const fullName = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
    const dirty = firstName.trim() !== (user?.firstName ?? '') || lastName.trim() !== (user?.lastName ?? '');

    const submit = async () => {
        const next = { firstName: firstName.trim(), lastName: lastName.trim() };
        if (!next.firstName) {
            setStatus('Enter your first name to save.');
            return;
        }
        setSaving(true);
        setStatus('');
        try {
            await dispatch(updateProfile(next)).unwrap();
            setFirstName(next.firstName);
            setLastName(next.lastName);
            setStatus('Profile saved.');
        } catch (e: any) {
            setStatus(e?.message ?? 'Could not save your profile. Try again.');
        } finally {
            setSaving(false);
        }
    };

    const reset = () =>
        Alert.alert(
            'Reset all app data?',
            'This permanently deletes your workout plan, logged weights, and body weight entries, on this phone and on the server. Your account and name stay. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete everything',
                    style: 'destructive',
                    onPress: () => {
                        dispatch(resetTracker());
                        dispatch(clearServerTracker());
                        dispatch(resetPlan(Object.values(byDay).flat().map((p) => p.id)));
                        setStatus('All workout data was reset.');
                    },
                },
            ]
        );

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

                        <View style={{ alignItems: 'center', gap: 4 }}>
                            <Text style={{ color: fullName ? C.text : C.muted, fontSize: 25, fontWeight: '800' }}>
                                {fullName || 'Your name'}
                            </Text>
                            {user?.email ? <Text style={{ color: C.muted }}>{user.email}</Text> : null}
                        </View>

                        <View style={{ width: '100%', gap: 16 }}>
                            <Field label="First name" value={firstName} onChangeText={setFirstName} placeholder="Enter your first name" />
                            <Field label="Last name" value={lastName} onChangeText={setLastName} placeholder="Enter your last name" />
                        </View>

                        {status ? <Text style={{ color: C.muted, textAlign: 'center' }}>{status}</Text> : null}

                        <View style={{ width: '100%', gap: 12 }}>
                            <Pressable
                                onPress={submit}
                                disabled={saving || !dirty}
                                style={{ backgroundColor: C.yellow, borderRadius: 14, paddingVertical: 14, alignItems: 'center', opacity: saving || !dirty ? 0.5 : 1 }}>
                                {saving ? <ActivityIndicator color="#000" /> : <Text style={{ color: '#000', fontSize: 16, fontWeight: '800' }}>Save profile</Text>}
                            </Pressable>
                            <Pressable onPress={reset} style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center', borderWidth: 1, borderColor: C.danger }}>
                                <Text style={{ color: C.danger, fontSize: 16, fontWeight: '800' }}>Reset all data</Text>
                            </Pressable>
                            <Pressable onPress={() => dispatch(logout())} style={{ borderRadius: 14, paddingVertical: 14, alignItems: 'center', backgroundColor: C.card }}>
                                <Text style={{ color: C.text, fontSize: 16, fontWeight: '800' }}>Log out</Text>
                            </Pressable>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}