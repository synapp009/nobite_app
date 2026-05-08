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
  const [showResetConfirm, setShowResetConfirm] = React.useState(false);
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const handleReset = () => {
    setShowResetConfirm(true);
  };

  const confirmReset = async () => {
    await resetStore();
    setShowResetConfirm(false);
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

      {/* Custom Reset Confirmation Overlay */}
      {showResetConfirm && (
        <View style={[styles.absoluteOverlay, { backgroundColor: t.isDark ? 'rgba(17,20,24,0.98)' : 'rgba(245,247,250,0.98)' }]}>
          <View style={[styles.confirmCard, { backgroundColor: t.bgCard }]}>
            <View style={[styles.warningIconWrap, { backgroundColor: '#ff767522' }]}>
              <RefreshCw size={32} color="#ff7675" />
            </View>
            <Text style={[styles.confirmTitle, { color: t.text }]}>Wirklich zurücksetzen?</Text>
            <Text style={[styles.confirmText, { color: t.textSub }]}>
              Alle deine Logs, Fortschritte und Einstellungen werden unwiderruflich gelöscht. Möchtest du wirklich von vorne beginnen?
            </Text>

            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: t.bgSubtle, flex: 1 }]}
                onPress={() => setShowResetConfirm(false)}
              >
                <Text style={[styles.actionButtonText, { color: t.text }]}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#ff7675', flex: 1 }]}
                onPress={confirmReset}
              >
                <Text style={styles.actionButtonText}>Ja, zurücksetzen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
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
  absoluteOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  confirmCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#5BAFD6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  warningIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  confirmTitle: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 4,
  },
  confirmText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});
