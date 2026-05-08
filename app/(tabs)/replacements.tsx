import { useTheme } from '@/hooks/useTheme';
import { Trigger, useStore } from '@/store/useStore';
import { Check, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_TRIGGERS: Trigger[] = ['Stress', 'Langeweile', 'Grübeln', 'Müdigkeit'];

export default function ReplacementsScreen() {
  const { replacements, setReplacement, events } = useStore();
  const insets = useSafeAreaInsets();
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);
  const [inputValue, setInputValue] = useState('');
  const t = useTheme();

  const customTriggers = Array.from(new Set(events.map(e => e.trigger)))
    .filter(t => !DEFAULT_TRIGGERS.includes(t));
  const allTriggers = [...DEFAULT_TRIGGERS, ...customTriggers];

  const handleSave = (trigger: Trigger) => {
    if (inputValue.trim()) {
      setReplacement(trigger, inputValue.trim());
    }
    setEditingTrigger(null);
    setInputValue('');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: t.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.text }]}>Ersatzhandlungen</Text>
          <Text style={[styles.subtitle, { color: t.textSub }]}>
            Lege für jeden Trigger fest, was du stattdessen tun möchtest.
          </Text>
        </View>

        {allTriggers.map(trigger => {
          const currentReplacement = replacements.find(r => r.trigger === trigger);
          const isEditing = editingTrigger === trigger;

          return (
            <View key={trigger} style={[styles.card, { backgroundColor: t.bgCard }]}>
              <Text style={[styles.triggerText, { color: t.textSub }]}>
                Wenn ich <Text style={[styles.triggerHighlight, { color: t.text }]}>{trigger}</Text> habe...
              </Text>

              {isEditing ? (
                <View style={styles.inputContainer}>
                  <Text style={[styles.arrow, { color: t.textMuted }]}>→</Text>
                  <TextInput
                    style={[styles.input, { backgroundColor: t.bgInput, color: t.text }]}
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder="Was machst du stattdessen?"
                    placeholderTextColor={t.textMuted}
                    autoFocus
                    onSubmitEditing={() => handleSave(trigger)}
                  />
                  <TouchableOpacity style={[styles.saveButton, { backgroundColor: t.accent }]} onPress={() => handleSave(trigger)}>
                    <Check color="white" size={20} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.actionContainer, { backgroundColor: t.bgSubtle }]}
                  onPress={() => {
                    setEditingTrigger(trigger);
                    setInputValue(currentReplacement?.action || '');
                  }}
                >
                  <Text style={[styles.arrow, { color: t.textMuted }]}>→</Text>
                  {currentReplacement ? (
                    <Text style={[styles.actionText, { color: t.accent }]}>{currentReplacement.action}</Text>
                  ) : (
                    <View style={styles.emptyAction}>
                      <Plus color={t.textMuted} size={20} />
                      <Text style={[styles.emptyActionText, { color: t.textMuted }]}>Hinzufügen</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, lineHeight: 22 },
  card: {
    borderRadius: 18, padding: 20, marginBottom: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 3,
  },
  triggerText: { fontSize: 16, marginBottom: 15 },
  triggerHighlight: { fontWeight: 'bold' },
  actionContainer: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12 },
  arrow: { fontSize: 18, marginRight: 10 },
  actionText: { fontSize: 16, fontWeight: '600', flex: 1 },
  emptyAction: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  emptyActionText: { fontSize: 16 },
  inputContainer: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, padding: 15, borderRadius: 12, fontSize: 16 },
  saveButton: { padding: 15, borderRadius: 12, marginLeft: 10, justifyContent: 'center', alignItems: 'center' },
});
