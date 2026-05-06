import { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useStore, Trigger } from '@/store/useStore';
import { Plus, Check } from 'lucide-react-native';

const DEFAULT_TRIGGERS: Trigger[] = ['Stress', 'Langeweile', 'Grübeln', 'Müdigkeit'];

export default function ReplacementsScreen() {
  const { replacements, setReplacement, events } = useStore();
  const insets = useSafeAreaInsets();
  const [editingTrigger, setEditingTrigger] = useState<Trigger | null>(null);
  const [inputValue, setInputValue] = useState('');

  // Extract unique custom triggers from logged events
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
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Ersatzhandlungen</Text>
          <Text style={styles.subtitle}>
            Lege für jeden Trigger fest, was du stattdessen tun möchtest.
          </Text>
        </View>

        {allTriggers.map(trigger => {
          const currentReplacement = replacements.find(r => r.trigger === trigger);
          const isEditing = editingTrigger === trigger;

          return (
            <View key={trigger} style={styles.card}>
              <Text style={styles.triggerText}>Wenn ich <Text style={styles.triggerHighlight}>{trigger}</Text> habe...</Text>
              
              {isEditing ? (
                <View style={styles.inputContainer}>
                  <Text style={styles.arrow}>→</Text>
                  <TextInput
                    style={styles.input}
                    value={inputValue}
                    onChangeText={setInputValue}
                    placeholder="Was machst du stattdessen?"
                    autoFocus
                    onSubmitEditing={() => handleSave(trigger)}
                  />
                  <TouchableOpacity 
                    style={styles.saveButton}
                    onPress={() => handleSave(trigger)}
                  >
                    <Check color="white" size={20} />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.actionContainer}
                  onPress={() => {
                    setEditingTrigger(trigger);
                    setInputValue(currentReplacement?.action || '');
                  }}
                >
                  <Text style={styles.arrow}>→</Text>
                  {currentReplacement ? (
                    <Text style={styles.actionText}>{currentReplacement.action}</Text>
                  ) : (
                    <View style={styles.emptyAction}>
                      <Plus color="#a4b0be" size={20} />
                      <Text style={styles.emptyActionText}>Hinzufügen</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    lineHeight: 22,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  triggerText: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 15,
  },
  triggerHighlight: {
    fontWeight: 'bold',
    color: '#2d3436',
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f2f6',
    padding: 15,
    borderRadius: 10,
  },
  arrow: {
    fontSize: 18,
    color: '#a4b0be',
    marginRight: 10,
  },
  actionText: {
    fontSize: 16,
    color: '#8fd8a4',
    fontWeight: '600',
    flex: 1,
  },
  emptyAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  emptyActionText: {
    color: '#a4b0be',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    color: '#2d3436',
  },
  saveButton: {
    backgroundColor: '#8fd8a4',
    padding: 15,
    borderRadius: 10,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
