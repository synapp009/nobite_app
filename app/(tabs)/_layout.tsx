import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { Tabs } from 'expo-router';
import { BarChart3, Settings, Settings2, ShieldAlert } from 'lucide-react-native';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  const t = useTheme();
  const tintColor = t.accent;
  const { initFirstLaunch, hasCompletedOnboarding } = useStore();

  useEffect(() => {
    initFirstLaunch();
  }, [initFirstLaunch]);

  const hiddenDuringOnboarding = !hasCompletedOnboarding
    ? { headerShown: false, tabBarStyle: { display: 'none' as const } }
    : {};

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tintColor,
        tabBarInactiveTintColor: t.isDark ? '#3A5070' : '#B0C4D8',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: t.tabBar,
          borderTopWidth: 1,
          borderTopColor: t.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Log',
          tabBarIcon: ({ color, size }) => <ShieldAlert size={size} color={color} />,
          ...hiddenDuringOnboarding,
        }}
      />
      <Tabs.Screen
        name="patterns"
        options={{
          tabBarLabel: 'Muster',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="replacements"
        options={{
          tabBarLabel: 'Strategien',
          tabBarIcon: ({ color, size }) => <Settings2 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
