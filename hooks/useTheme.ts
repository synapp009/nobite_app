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
  // Accent (sky blue)
  accent: string;
  accentBg: string;
  accentMuted: string;
  // Special
  tabBar: string;
  header: string;
  isDark: boolean;
}

const light: Theme = {
  bg: '#FFFFFF',
  bgCard: '#F4F5F7',
  bgSubtle: '#F4F5F7',
  bgInput: '#F4F5F7',
  text: '#1A2533',
  textSub: '#6B7A8D',
  textMuted: '#A8B4C0',
  border: '#DDE6F0',
  accent: '#5BAFD6',
  accentBg: '#D6EBF7',
  accentMuted: '#EAF4FB',
  tabBar: '#121A26',
  header: '#FFFFFF',
  isDark: false,
};

const dark: Theme = {
  bg: '#0F1923',
  bgCard: '#18253A',
  bgSubtle: '#1E2F45',
  bgInput: '#243650',
  text: '#E8F0F9',
  textSub: '#7E95B0',
  textMuted: '#4A6070',
  border: '#243650',
  accent: '#5BAFD6',
  accentBg: '#1A3A52',
  accentMuted: '#152D40',
  tabBar: '#121E2E',
  header: '#121E2E',
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
