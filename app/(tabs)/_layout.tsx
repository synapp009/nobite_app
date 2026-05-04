import { Tabs } from 'expo-router';
import { ShieldAlert, BarChart3, Settings2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function TabLayout() {
  const tintColor = '#2b7a78';
  const { initFirstLaunch, firstLaunchAt, hasCompletedOnboarding } = useStore();

  useEffect(() => {
    initFirstLaunch();
  }, [initFirstLaunch]);

  const now = Date.now();
  const daysSinceLaunch = firstLaunchAt ? Math.floor((now - firstLaunchAt) / (1000 * 60 * 60 * 24)) : 0;
  const isObservationPhase = daysSinceLaunch < 5;

  const hiddenDuringOnboarding = !hasCompletedOnboarding
    ? { headerShown: false, tabBarStyle: { display: 'none' as const } }
    : {};

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: '#a4b0be',
        headerShown: true,
        headerTintColor: tintColor,
        headerStyle: {
          backgroundColor: '#fff',
        },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f1f2f6',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Log',
          tabBarIcon: ({ color }) => <ShieldAlert size={28} color={color} />,
          ...hiddenDuringOnboarding,
        }}
      />
      <Tabs.Screen
        name="patterns"
        options={{
          title: 'Patterns',
          tabBarIcon: ({ color }) => <BarChart3 size={28} color={color} />,
        }}
      />
      <Tabs.Screen
        name="replacements"
        options={{
          title: 'Replacements',
          tabBarIcon: ({ color }) => <Settings2 size={28} color={color} />,
        }}
      />
    </Tabs>
  );
}
