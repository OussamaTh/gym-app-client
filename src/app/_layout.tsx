import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';
import AuthScreen from '@/components/auth-screen';
import { C } from '@/constants/gym';
import { store } from '@/store';
import { bootstrap } from '@/store/auth-slice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPlans } from '@/store/plan-slice';
import { loadTracker, syncTracker } from '@/store/tracker-slice';

const icon = (name: keyof typeof Ionicons.glyphMap) =>
  ({ color, size }: { color: string; size: number }) => <Ionicons name={name} size={size} color={color} />;

function Gate() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);
  const userId = useAppSelector((s) => s.auth.user?.id);

  useEffect(() => { dispatch(bootstrap()); }, [dispatch]);

  // Runs after login, register, or a restored session
  useEffect(() => {
    if (!userId) return;
    dispatch(fetchPlans());
    dispatch(loadTracker(userId)).then(() => dispatch(syncTracker()));
  }, [userId, dispatch]);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, backgroundColor: C.bg, justifyContent: 'center' }}>
        <ActivityIndicator color={C.yellow} size="large" />
      </View>
    );
  }
  if (status === 'out') return <AuthScreen />;

  return (
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
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <StatusBar style="light" />
      <Gate />
    </Provider>
  );
}