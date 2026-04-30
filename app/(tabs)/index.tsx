import { useState, useRef } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Pressable, Platform, TextInput, Animated } from 'react-native';
import { useStore, Trigger } from '@/store/useStore';
import { Check, X, Plus } from 'lucide-react-native';

const DEFAULT_TRIGGERS: Trigger[] = ['Stress', 'Langeweile', 'Grübeln', 'Müdigkeit'];

export default function LogScreen() {
  const [showTriggers, setShowTriggers] = useState(false);
  const [intervention, setIntervention] = useState<{ trigger: Trigger; action: string; eventId: string } | null>(null);
  const [isCustomTrigger, setIsCustomTrigger] = useState(false);
  const [customTriggerText, setCustomTriggerText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(0)).current;
  
  const { logEvent, markAsReplaced, replacements, firstLaunchAt, events } = useStore();

  const now = Date.now();
  const daysSinceLaunch = firstLaunchAt ? Math.floor((now - firstLaunchAt) / (1000 * 60 * 60 * 24)) : 0;
  const isObservationPhase = daysSinceLaunch < 5;

  // Extract unique custom triggers from logged events
  const customTriggers = Array.from(new Set(events.map(e => e.trigger)))
    .filter(t => !DEFAULT_TRIGGERS.includes(t));
  
  const allTriggers = [...DEFAULT_TRIGGERS, ...customTriggers];

  const handleTriggerSelect = (trigger: Trigger) => {
    setShowTriggers(false);
    const eventId = logEvent(trigger);

    if (!isObservationPhase) {
      const replacement = replacements.find(r => r.trigger === trigger);
      if (replacement) {
        setIntervention({ trigger, action: replacement.action, eventId });
        return;
      }
    }
    
    setShowSuccess(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 5,
    }).start();

    setTimeout(() => {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowSuccess(false);
      });
    }, 1500);
  };

  const handleInterventionDone = () => {
    if (intervention) {
      markAsReplaced(intervention.eventId);
    }
    setIntervention(null);
    
    setShowSuccess(true);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 5,
    }).start();

    setTimeout(() => {
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start(() => {
        setShowSuccess(false);
      });
    }, 1500);
  };

  const handleInterventionIgnored = () => {
    setIntervention(null);
  };

  return (
    <View style={styles.container}>
      {/* 1. Intervention UI */}
      {!!intervention && (
        <View style={[styles.content, { padding: 20 }]}>
          <Text style={styles.interventionTitle}>Statt Nägelkauen:</Text>
          <Text style={styles.interventionAction}>👉 {intervention.action}</Text>
          
          <View style={styles.interventionActions}>
            <Pressable 
              style={[styles.actionButton, styles.actionButtonSuccess]}
              onPress={handleInterventionDone}
            >
              <Check color="white" size={24} />
              <Text style={styles.actionButtonText}>Gemacht</Text>
            </Pressable>
            
            <Pressable 
              style={[styles.actionButton, styles.actionButtonError]}
              onPress={handleInterventionIgnored}
            >
              <X color="white" size={24} />
              <Text style={styles.actionButtonText}>Ignoriert</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* 2. Trigger Selection UI */}
      {!intervention && showTriggers && (
        <View style={[styles.content, { padding: 20, justifyContent: 'center' }]}>
          <Text style={styles.modalTitle}>Warum?</Text>
          <View style={{ width: '100%', maxWidth: 400 }}>
            {!isCustomTrigger ? (
              <>
                {allTriggers.map(t => (
                  <Pressable 
                    key={t} 
                    style={({ pressed }) => [styles.triggerButton, pressed && { opacity: 0.8 }]}
                    onPress={() => handleTriggerSelect(t)}
                  >
                    <Text style={styles.triggerText}>{t}</Text>
                  </Pressable>
                ))}
                
                <Pressable 
                  style={({ pressed }) => [styles.triggerButton, { backgroundColor: '#eccc68' }, pressed && { opacity: 0.8 }]}
                  onPress={() => setIsCustomTrigger(true)}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Plus color="#2d3436" size={20} />
                    <Text style={[styles.triggerText, { color: '#2d3436', fontWeight: 'bold' }]}>Eigenen Grund eingeben</Text>
                  </View>
                </Pressable>

                <Pressable 
                  style={({ pressed }) => [styles.triggerButton, styles.triggerButtonCancel, pressed && { opacity: 0.8 }]}
                  onPress={() => setShowTriggers(false)}
                >
                  <Text style={styles.triggerTextCancel}>Abbrechen</Text>
                </Pressable>
              </>
            ) : (
              <View>
                <TextInput
                  style={styles.customInput}
                  placeholder="Dein eigener Grund..."
                  value={customTriggerText}
                  onChangeText={setCustomTriggerText}
                  autoFocus
                  onSubmitEditing={() => {
                    if (customTriggerText.trim()) {
                      handleTriggerSelect(customTriggerText.trim());
                      setCustomTriggerText('');
                      setIsCustomTrigger(false);
                    }
                  }}
                />
                
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
                  <Pressable 
                    style={({ pressed }) => [styles.actionButton, styles.actionButtonSuccess, pressed && { opacity: 0.8 }]}
                    onPress={() => {
                      if (customTriggerText.trim()) {
                        handleTriggerSelect(customTriggerText.trim());
                        setCustomTriggerText('');
                        setIsCustomTrigger(false);
                      }
                    }}
                  >
                    <Text style={styles.actionButtonText}>Speichern</Text>
                  </Pressable>

                  <Pressable 
                    style={({ pressed }) => [styles.actionButton, { backgroundColor: '#a4b0be' }, pressed && { opacity: 0.8 }]}
                    onPress={() => {
                      setIsCustomTrigger(false);
                      setCustomTriggerText('');
                    }}
                  >
                    <Text style={styles.actionButtonText}>Zurück</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </View>
        </View>
      )}

      {/* 3. Main Button UI */}
      {!intervention && !showTriggers && !showSuccess && (
        <View style={styles.content}>
          {Platform.OS === 'web' ? (
            <button 
              onClick={() => setShowTriggers(true)}
              style={{
                backgroundColor: '#ff6b6b',
                width: '280px',
                height: '280px',
                borderRadius: '140px',
                color: 'white',
                fontSize: '24px',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 10px 20px rgba(255, 107, 107, 0.3)'
              }}
            >
              Ich kaue gerade Nägel
            </button>
          ) : (
            <Pressable 
              style={({ pressed }) => [
                styles.mainButton,
                pressed && { opacity: 0.8 }
              ]} 
              onPress={() => setShowTriggers(true)}
            >
              <Text style={styles.mainButtonText}>Ich kaue gerade Nägel</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* 4. Success Animation UI */}
      {showSuccess && (
        <View style={styles.content}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
            <View style={{ backgroundColor: '#20bf6b', padding: 30, borderRadius: 100, marginBottom: 20 }}>
              <Check color="white" size={60} />
            </View>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#2d3436' }}>Gespeichert!</Text>
            <Text style={{ fontSize: 16, color: '#636e72', marginTop: 10 }}>Grund erfolgreich erfasst.</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  absoluteOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mainButton: {
    backgroundColor: '#ff6b6b',
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ff6b6b',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  mainButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 30,
    paddingBottom: 50,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 20,
    textAlign: 'center',
  },
  triggerButton: {
    backgroundColor: '#f1f2f6',
    padding: 18,
    borderRadius: 15,
    marginBottom: 10,
    alignItems: 'center',
  },
  triggerText: {
    fontSize: 18,
    color: '#2d3436',
    fontWeight: '500',
  },
  triggerButtonCancel: {
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  triggerTextCancel: {
    fontSize: 18,
    color: '#a4b0be',
  },
  interventionContent: {
    alignItems: 'center',
    paddingTop: 40,
  },
  interventionTitle: {
    fontSize: 20,
    color: '#636e72',
    marginBottom: 10,
  },
  interventionAction: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2b7a78',
    marginBottom: 40,
    textAlign: 'center',
  },
  interventionActions: {
    flexDirection: 'row',
    gap: 15,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    padding: 18,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonSuccess: {
    backgroundColor: '#20bf6b',
  },
  actionButtonError: {
    backgroundColor: '#eb3b5a',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customInput: {
    backgroundColor: '#f1f2f6',
    padding: 18,
    borderRadius: 15,
    fontSize: 18,
    color: '#2d3436',
    width: '100%',
  },
});
