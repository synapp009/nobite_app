import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { Tabs } from 'expo-router';
import { BarChart3, Settings, Settings2, ShieldAlert } from 'lucide-react-native';
import { useEffect } from 'react';
import { Platform, View, Text } from 'react-native';

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
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#121A26',
          borderTopWidth: 0,
          height: 70,
          paddingBottom: 12,
          paddingTop: 12,
        },
        tabBarIconStyle: {
          flex: 1,
          width: '100%',
          height: '100%',
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? t.accent : 'transparent',
              paddingHorizontal: focused ? 14 : 0,
              paddingVertical: focused ? 8 : 0,
              borderRadius: 14,
            }}>
              <ShieldAlert size={22} color={focused ? '#FFF' : '#6B7A8D'} />
              {focused && <Text numberOfLines={1} style={{ color: '#FFF', fontWeight: '600', fontSize: 13, marginLeft: 6, flexShrink: 0 }}>Log</Text>}
            </View>
          ),
          ...hiddenDuringOnboarding,
        }}
      />
      <Tabs.Screen
        name="patterns"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? t.accent : 'transparent',
              paddingHorizontal: focused ? 14 : 0,
              paddingVertical: focused ? 8 : 0,
              borderRadius: 14,
            }}>
              <BarChart3 size={22} color={focused ? '#FFF' : '#6B7A8D'} />
              {focused && <Text numberOfLines={1} style={{ color: '#FFF', fontWeight: '600', fontSize: 13, marginLeft: 6, flexShrink: 0 }}>Muster</Text>}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="replacements"
        options={{
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? t.accent : 'transparent',
              paddingHorizontal: focused ? 14 : 0,
              paddingVertical: focused ? 8 : 0,
              borderRadius: 14,
            }}>
              <Settings2 size={22} color={focused ? '#FFF' : '#6B7A8D'} />
              {focused && <Text numberOfLines={1} style={{ color: '#FFF', fontWeight: '600', fontSize: 12, marginLeft: 6, flexShrink: 0 }}>Strategien</Text>}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: focused ? t.accent : 'transparent',
              paddingHorizontal: focused ? 14 : 0,
              paddingVertical: focused ? 8 : 0,
              borderRadius: 14,
            }}>
              <Settings size={22} color={focused ? '#FFF' : '#6B7A8D'} />
              {focused && <Text numberOfLines={1} style={{ color: '#FFF', fontWeight: '600', fontSize: 13, marginLeft: 6, flexShrink: 0 }}>Settings</Text>}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
