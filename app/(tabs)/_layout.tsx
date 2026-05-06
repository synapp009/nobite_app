import { Tabs } from 'expo-router';
import { ShieldAlert, BarChart3, Settings2, Settings } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { useStore } from '@/store/useStore';
import { SettingsModal } from '@/components/SettingsModal';
import { useTheme } from '@/hooks/useTheme';

function SettingsButton() {
  const [visible, setVisible] = useState(false);
  const t = useTheme();
  return (
    <>
      <TouchableOpacity
        onPress={() => setVisible(true)}
        style={{ marginRight: 16, padding: 4 }}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Settings size={22} color={t.textSub} />
      </TouchableOpacity>
      <SettingsModal visible={visible} onClose={() => setVisible(false)} />
    </>
  );
}

export default function TabLayout() {
  const t = useTheme();
  const tintColor = '#8fd8a4';
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
        tabBarInactiveTintColor: t.isDark ? '#4a5568' : '#c4cdd4',
        headerShown: true,
        headerTintColor: tintColor,
        headerStyle: {
          backgroundColor: t.header,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: t.isDark ? 0.3 : 0.06,
              shadowRadius: 8,
            },
            android: { elevation: 3 },
            default: {},
          }),
        },
        headerShadowVisible: false,
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
          letterSpacing: 0.3,
          color: t.text,
        },
        headerRight: () => <SettingsButton />,
        tabBarStyle: {
          backgroundColor: t.tabBar,
          borderTopWidth: 0,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: t.isDark ? 0.4 : 0.05,
              shadowRadius: 12,
            },
            android: { elevation: 8 },
            default: {},
          }),
          height: 60,
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
          headerTitle: 'NoBite',
          tabBarLabel: 'Log',
          tabBarIcon: ({ color, size }) => <ShieldAlert size={size} color={color} />,
          ...hiddenDuringOnboarding,
        }}
      />
      <Tabs.Screen
        name="patterns"
        options={{
          headerTitle: 'Muster',
          tabBarLabel: 'Muster',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="replacements"
        options={{
          headerTitle: 'Strategien',
          tabBarLabel: 'Strategien',
          tabBarIcon: ({ color, size }) => <Settings2 size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
