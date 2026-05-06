import { useTheme } from '@/hooks/useTheme';
import { useStore } from '@/store/useStore';
import { Monitor, Moon, RefreshCw } from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const { darkMode, useSystemTheme, setDarkMode, setUseSystemTheme, resetStore } = useStore();
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const handleReset = () => {
    Alert.alert(
      'Therapie zurücksetzen',
      'Bist du sicher? Alle deine Daten (Logs, Strategien, Fortschritt) werden unwiderruflich gelöscht und die Therapie startet von vorne.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: async () => {
            await resetStore();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top }]}>
      {/* Header Area (Simulated) */}
      <View style={[styles.header, { borderBottomColor: t.border, backgroundColor: t.bgCard }]}>
        <Text style={[styles.headerTitle, { color: t.text }]}>Einstellungen</Text>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}>
        {/* Appearance section */}
        <Text style={[styles.sectionLabel, { color: t.textMuted }]}>DARSTELLUNG</Text>
        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          {/* System theme toggle */}
          <View style={[styles.row, { borderBottomColor: t.border }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#6c5ce722' }]}>
                <Monitor size={18} color="#6c5ce7" />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: t.text }]}>System-Theme</Text>
                <Text style={[styles.rowSub, { color: t.textSub }]}>Dark Mode vom Gerät übernehmen</Text>
              </View>
            </View>
            <Switch
              value={useSystemTheme}
              onValueChange={setUseSystemTheme}
              trackColor={{ false: t.border, true: '#6c5ce7' }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Manual dark mode toggle */}
          <View style={[styles.row, { opacity: useSystemTheme ? 0.4 : 1 }]}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#2d3436' }]}>
                <Moon size={18} color="#fdcb6e" />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: t.text }]}>Dark Mode</Text>
                <Text style={[styles.rowSub, { color: t.textSub }]}>Dunkles Design aktivieren</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              disabled={useSystemTheme}
              trackColor={{ false: t.border, true: '#2d3436' }}
              thumbColor="#fdcb6e"
            />
          </View>
        </View>

        {/* Danger zone */}
        <Text style={[styles.sectionLabel, { color: t.textMuted }]}>THERAPIE</Text>
        <View style={[styles.card, { backgroundColor: t.bgCard, borderColor: t.border }]}>
          <TouchableOpacity style={styles.row} onPress={handleReset} activeOpacity={0.7}>
            <View style={styles.rowLeft}>
              <View style={[styles.iconWrap, { backgroundColor: '#ff7675' + '22' }]}>
                <RefreshCw size={18} color="#ff7675" />
              </View>
              <View>
                <Text style={[styles.rowTitle, { color: '#ff7675' }]}>Therapie zurücksetzen</Text>
                <Text style={[styles.rowSub, { color: t.textSub }]}>Alle Daten löschen &amp; neu starten</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { color: t.textMuted }]}>NoBite v1.0.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    gap: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  rowSub: {
    fontSize: 12,
    marginTop: 2,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 32,
    marginBottom: 16,
  },
});
