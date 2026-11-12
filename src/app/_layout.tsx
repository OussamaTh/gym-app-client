import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { C } from '@/constants/gym';
import { GymProvider } from '@/store/gym-store';

const icon = (name: keyof typeof Ionicons.glyphMap) =>
  ({ color, size }: { color: string; size: number }) => <Ionicons name={name} size={size} color={color} />;

export default function RootLayout() {
  return (
    <GymProvider>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: C.yellow,
          tabBarInactiveTintColor: C.muted,
          tabBarStyle: { backgroundColor: C.bg, borderTopColor: C.line, height: 64, paddingTop: 6, paddingBottom: 8 },
          tabBarLabelStyle: { fontWeight: '700', fontSize: 11 },
        }}>
        <Tabs.Screen name="index" options={{ title: 'Train', tabBarIcon: icon('barbell') }} />
        <Tabs.Screen name="progress" options={{ title: 'Progress', tabBarIcon: icon('trending-up') }} />
        <Tabs.Screen name="explore" options={{ title: 'Body', tabBarIcon: icon('scale') }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: icon('person') }} />
      </Tabs>
    </GymProvider>
  );
} 