import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { StoreProvider } from '@/store/useStore';

export const unstable_settings = {
  anchor: '(tabs)',
};

import { useTheme } from '@/hooks/useTheme';

function ThemeAwareStatusBar() {
  const t = useTheme();
  return <StatusBar style={t.isDark ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StoreProvider>
        <ThemeAwareStatusBar />
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </StoreProvider>
    </ThemeProvider>
  );
}
