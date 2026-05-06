import { useColorScheme } from 'react-native';
import { useStore } from '@/store/useStore';

export interface Theme {
  // Backgrounds
  bg: string;
  bgCard: string;
  bgSubtle: string;
  bgInput: string;
  // Text
  text: string;
  textSub: string;
  textMuted: string;
  // Borders
  border: string;
  // Special
  tabBar: string;
  header: string;
  isDark: boolean;
}

const light: Theme = {
  bg: '#f0f4f8',
  bgCard: '#ffffff',
  bgSubtle: '#f7f8fa',
  bgInput: '#f0f4f8',
  text: '#2d3436',
  textSub: '#636e72',
  textMuted: '#a4b0be',
  border: '#e8ecf0',
  tabBar: '#ffffff',
  header: '#ffffff',
  isDark: false,
};

const dark: Theme = {
  bg: '#111418',
  bgCard: '#1e2228',
  bgSubtle: '#252b33',
  bgInput: '#2a3040',
  text: '#f0f4f8',
  textSub: '#94a3b8',
  textMuted: '#64748b',
  border: '#2d3748',
  tabBar: '#161b22',
  header: '#161b22',
  isDark: true,
};

export function useTheme(): Theme {
  const { darkMode, useSystemTheme } = useStore();
  const systemScheme = useColorScheme();

  if (useSystemTheme) {
    return systemScheme === 'dark' ? dark : light;
  }
  return darkMode ? dark : light;
}
