import { Tabs } from 'expo-router';
import { ShieldAlert, BarChart3, Settings2 } from 'lucide-react-native';
import { useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useStore } from '@/store/useStore';

// Custom header title component
function AppHeader({ title }: { title: string }) {
  return (
    <View style={headerStyles.container}>
      <Text style={headerStyles.title}>{title}</Text>
    </View>
  );
}

const headerStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2d3436',
    letterSpacing: 0.3,
  },
});

export default function TabLayout() {
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
        tabBarInactiveTintColor: '#c4cdd4',
        headerShown: false,
        headerTintColor: tintColor,
        headerStyle: {
          backgroundColor: '#ffffff',
          // Shadow for floating effect
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
            },
            android: { elevation: 3 },
            default: {},
          }),
        },
        // Remove the default bottom border line
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          // Soft shadow on tab bar instead of a hard border
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.05,
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
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 17,
          letterSpacing: 0.3,
          color: '#2d3436',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          headerTitle: () => <AppHeader title="NoBite" />,
          tabBarLabel: 'Log',
          tabBarIcon: ({ color, size }) => <ShieldAlert size={size} color={color} />,
          ...hiddenDuringOnboarding,
        }}
      />
      <Tabs.Screen
        name="patterns"
        options={{
          headerTitle: () => <AppHeader title="Muster" />,
          tabBarLabel: 'Muster',
          tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="replacements"
        options={{
          headerTitle: () => <AppHeader title="Strategien" />,
          tabBarLabel: 'Strategien',
          tabBarIcon: ({ color, size }) => <Settings2 size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
