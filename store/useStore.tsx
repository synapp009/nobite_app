import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export type Trigger = 'Stress' | 'Langeweile' | 'Grübeln' | 'Müdigkeit' | string;

export interface AppEvent {
  id: string;
  timestamp: number;
  trigger: Trigger;
  intensity?: number;
  replaced?: boolean;
}

export interface Replacement {
  trigger: Trigger;
  action: string;
}

export interface AppState {
  events: AppEvent[];
  replacements: Replacement[];
  firstLaunchAt: number | null;
  hasCompletedOnboarding: boolean;
  darkMode: boolean;
  useSystemTheme: boolean;
  initFirstLaunch: () => void;
  logEvent: (trigger: Trigger, intensity?: number) => string;
  markAsReplaced: (eventId: string) => void;
  setReplacement: (trigger: Trigger, action: string) => void;
  setHasCompletedOnboarding: (status: boolean) => void;
  debugSetFirstLaunch: (timestamp: number) => void;
  resetStore: () => Promise<void>;
  setDarkMode: (enabled: boolean) => void;
  setUseSystemTheme: (enabled: boolean) => void;
}

const StoreContext = createContext<AppState | null>(null);

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [replacements, setReplacements] = useState<Replacement[]>([]);
  const [firstLaunchAt, setFirstLaunchAt] = useState<number | null>(null);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [darkMode, setDarkModeState] = useState(false);
  const [useSystemTheme, setUseSystemThemeState] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadState = async () => {
      try {
        const storedState = await AsyncStorage.getItem('nobite-storage');
        if (storedState) {
          const parsed = JSON.parse(storedState);
          setEvents(parsed.events || []);
          setReplacements(parsed.replacements || []);
          setFirstLaunchAt(parsed.firstLaunchAt || null);
          setHasCompletedOnboarding(parsed.hasCompletedOnboarding || false);
          setDarkModeState(parsed.darkMode || false);
          setUseSystemThemeState(parsed.useSystemTheme !== undefined ? parsed.useSystemTheme : true);
        }
      } catch (e) {
        console.error('Failed to load state', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadState();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      AsyncStorage.setItem('nobite-storage', JSON.stringify({
        events, replacements, firstLaunchAt, hasCompletedOnboarding, darkMode, useSystemTheme
      }));
    }
  }, [events, replacements, firstLaunchAt, hasCompletedOnboarding, darkMode, useSystemTheme, isLoaded]);

  const initFirstLaunch = () => {
    if (!firstLaunchAt) {
      setFirstLaunchAt(Date.now());
    }
  };

  const logEvent = (trigger: Trigger, intensity?: number) => {
    const id = Crypto.randomUUID();
    const newEvent: AppEvent = {
      id,
      timestamp: Date.now(),
      trigger,
      intensity,
      replaced: false,
    };
    setEvents(prev => [newEvent, ...prev]);
    return id;
  };

  const markAsReplaced = (eventId: string) => {
    setEvents(prev => prev.map(e => e.id === eventId ? { ...e, replaced: true } : e));
  };

  const setReplacement = (trigger: Trigger, action: string) => {
    setReplacements(prev => {
      const existing = prev.find(r => r.trigger === trigger);
      if (existing) {
        return prev.map(r => r.trigger === trigger ? { ...r, action } : r);
      }
      return [...prev, { trigger, action }];
    });
  };

  const debugSetFirstLaunch = (timestamp: number) => {
    setFirstLaunchAt(timestamp);
  };

  const resetStore = async () => {
    try {
      await AsyncStorage.removeItem('nobite-storage');
      setEvents([]);
      setReplacements([]);
      setFirstLaunchAt(null);
      setHasCompletedOnboarding(false);
    } catch (e) {
      console.error('Failed to reset store', e);
    }
  };

  const setDarkMode = (enabled: boolean) => setDarkModeState(enabled);
  const setUseSystemTheme = (enabled: boolean) => setUseSystemThemeState(enabled);

  if (!isLoaded) return null;

  return (
    <StoreContext.Provider value={{ 
      events, 
      replacements, 
      firstLaunchAt, 
      hasCompletedOnboarding,
      darkMode,
      useSystemTheme,
      initFirstLaunch, 
      logEvent, 
      markAsReplaced, 
      setReplacement, 
      setHasCompletedOnboarding,
      debugSetFirstLaunch,
      resetStore,
      setDarkMode,
      setUseSystemTheme,
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};
