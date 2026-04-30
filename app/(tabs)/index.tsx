import { Trigger, useStore } from '@/store/useStore';
import { Check, Plus, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const DEFAULT_TRIGGERS: Trigger[] = ['Stress', 'Langeweile', 'Grübeln', 'Müdigkeit'];

export default function LogScreen() {
  const [showTriggers, setShowTriggers] = useState(false);
  const [intervention, setIntervention] = useState<{ trigger: Trigger; action: string; eventId: string } | null>(null);
  const [isCustomTrigger, setIsCustomTrigger] = useState(false);
  const [customTriggerText, setCustomTriggerText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;

  const { logEvent, markAsReplaced, replacements, firstLaunchAt, events, initFirstLaunch, setReplacement, debugSetFirstLaunch } = useStore();

  const [pendingReplacement, setPendingReplacement] = useState<{ trigger: Trigger; eventId: string } | null>(null);

  useEffect(() => {
    initFirstLaunch();
  }, []);

  // Extract unique custom triggers from logged events
  const customTriggers = Array.from(new Set(events.map(e => e.trigger)))
    .filter(t => !DEFAULT_TRIGGERS.includes(t));

  const allTriggers = [...DEFAULT_TRIGGERS, ...customTriggers];

  const now = Date.now();
  const daysSinceLaunch = firstLaunchAt ? Math.floor((now - firstLaunchAt) / (1000 * 60 * 60 * 24)) : 0;
  const isObservationPhase = daysSinceLaunch < 7;
  const daysRemaining = Math.max(0, 7 - daysSinceLaunch);

  // Triggers that need replacements after 7 days
  const triggersToFix = allTriggers.filter(t => !replacements.find(r => r.trigger === t));
  const showBatchSetup = !isObservationPhase && triggersToFix.length > 0;

  const handleTriggerSelect = (trigger: Trigger) => {
    setShowTriggers(false);
    const eventId = logEvent(trigger);

    if (!isObservationPhase) {
      const replacement = replacements.find(r => r.trigger === trigger);
      if (replacement) {
        setIntervention({ trigger, action: replacement.action, eventId });
        return;
      } else {
        // Force replacement entry
        setPendingReplacement({ trigger, eventId });
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

  const handleSaveForcedReplacement = (action: string) => {
    if (pendingReplacement) {
      setReplacement(pendingReplacement.trigger, action);
      setIntervention({
        trigger: pendingReplacement.trigger,
        action: action,
        eventId: pendingReplacement.eventId
      });
      setPendingReplacement(null);
    }
  };

  const [batchInput, setBatchInput] = useState('');
  const currentBatchTrigger = triggersToFix[0];

  const handleSaveBatchItem = () => {
    if (batchInput.trim() && currentBatchTrigger) {
      setReplacement(currentBatchTrigger, batchInput.trim());
      setBatchInput('');
    }
  };

  const content = (
    <View style={styles.container}>
      {/* 0. Timer / Status UI - Only show on main screen */}
      {!intervention && !showTriggers && !pendingReplacement && !showBatchSetup && !showSuccess && (
        isObservationPhase ? (
          <View style={styles.timerBadge}>
            <Text style={styles.timerText}>
              ⏱️ Noch <Text style={{ fontWeight: 'bold' }}>{daysRemaining} Tage</Text> Beobachtungsphase
            </Text>
            <TouchableOpacity
              onPress={() => debugSetFirstLaunch(Date.now() - 8 * 24 * 60 * 60 * 1000)}
              style={{ marginTop: 5, padding: 5 }}
            >
              <Text style={{ fontSize: 10, color: '#a4b0be', textDecorationLine: 'underline' }}>Debug: Phase überspringen</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={[styles.timerBadge, { backgroundColor: '#e8f8f0', borderColor: '#20bf6b', borderWidth: 1 }]}>
            <Text style={[styles.timerText, { color: '#20bf6b', fontWeight: 'bold' }]}>
              🚀 Interventionsphase aktiv (Tag {daysSinceLaunch - 6})
            </Text>
          </View>
        ))}

      {/* 0.5 Batch Setup UI (Global Popup) */}
      {showBatchSetup && (
        <View style={[styles.content, styles.batchOverlay]}>
          <View style={styles.batchCard}>
            <Text style={styles.modalTitle}>Setze deine Strategien</Text>
            <Text style={styles.batchSubtitle}>
              Die Beobachtung ist vorbei! Lege für jedes Muster eine Ersatzhandlung fest.
              ({triggersToFix.length} verbleibend)
            </Text>

            <View style={styles.batchItem}>
              <Text style={styles.batchTriggerLabel}>Wenn ich <Text style={{ fontWeight: 'bold' }}>{currentBatchTrigger}</Text> fühle...</Text>
              <TextInput
                style={styles.customInput}
                placeholder="Meine Ersatzhandlung..."
                value={batchInput}
                onChangeText={setBatchInput}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSuccess, { marginTop: 15 }]}
                onPress={handleSaveBatchItem}
              >
                <Text style={styles.actionButtonText}>Speichern & Weiter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
      {/* 1. Intervention UI */}
      {!!intervention && (
        <View style={[styles.content, { padding: 20 }]}>
          <Text style={styles.interventionTitle}>Statt Nägelkauen ({intervention.trigger}):</Text>
          <Text style={styles.interventionAction}>👉 {intervention.action}</Text>

          <View style={styles.interventionActions}>
            <Pressable
              style={[styles.actionButton, styles.actionButtonSuccess, { flex: 1 }]}
              onPress={handleInterventionDone}
            >
              <Check color="white" size={24} />
              <Text style={styles.actionButtonText}>Gemacht</Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, styles.actionButtonError, { flex: 1 }]}
              onPress={handleInterventionIgnored}
            >
              <X color="white" size={24} />
              <Text style={styles.actionButtonText}>Ignoriert</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* 1.5 Forced Replacement UI */}
      {!!pendingReplacement && (
        <View style={[styles.content, { padding: 20 }]}>
          <Text style={styles.modalTitle}>Ausgleichshandlung festlegen</Text>
          <Text style={{ textAlign: 'center', marginBottom: 20, color: '#636e72' }}>
            Was möchtest du stattdessen tun, wenn du <Text style={{ fontWeight: 'bold' }}>{pendingReplacement.trigger}</Text> spürst?
          </Text>

          <TextInput
            style={styles.customInput}
            placeholder="z.B. Faust ballen, tief atmen..."
            autoFocus
            onSubmitEditing={(e) => {
              if (e.nativeEvent.text.trim()) {
                handleSaveForcedReplacement(e.nativeEvent.text.trim());
              }
            }}
          />

          <Text style={{ marginTop: 10, fontSize: 12, color: '#a4b0be', textAlign: 'center' }}>
            Du musst eine Handlung festlegen, um fortzufahren.
          </Text>
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
                    style={({ pressed }) => [styles.actionButton, styles.actionButtonSuccess, { flex: 1 }, pressed && { opacity: 0.8 }]}
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
                    style={({ pressed }) => [styles.actionButton, { backgroundColor: '#a4b0be', flex: 1 }, pressed && { opacity: 0.8 }]}
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
        <View style={[styles.content, { justifyContent: 'flex-end', paddingBottom: 0 }]}>
          {Platform.OS === 'web' ? (
            <div style={{
              width: '300px',
              height: '420px',
              backgroundColor: '#d8a48f',
              borderRadius: '150px 150px 0 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '30px',
              boxShadow: 'inset 0 0 40px rgba(0,0,0,0.1), 0 20px 40px rgba(0,0,0,0.15)',
              position: 'relative'
            }}>
              {/* Finger crease */}
              <div style={{
                position: 'absolute',
                bottom: '100px',
                width: '180px',
                height: '2px',
                backgroundColor: 'rgba(0,0,0,0.1)',
                borderRadius: '50%',
                boxShadow: '0 5px 10px rgba(0,0,0,0.05)'
              }} />

              <button
                onClick={() => setShowTriggers(true)}
                style={{
                  backgroundColor: '#ffffff', // The white of the distal edge
                  width: '210px',
                  height: '295px',
                  borderTopLeftRadius: '105px',
                  borderTopRightRadius: '105px',
                  borderBottomLeftRadius: '90px',
                  borderBottomRightRadius: '90px',
                  border: 'none',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'transform 0.2s',
                  outline: 'none',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  padding: '0'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                {/* Nail Body (Pink) - layered on top to create concave white tip */}
                <div style={{
                  position: 'absolute',
                  top: '25px', // Distance of the white tip
                  left: '0',
                  right: '0',
                  bottom: '0',
                  backgroundColor: '#f8e3df',
                  borderTopLeftRadius: '90px',
                  borderTopRightRadius: '90px',
                  borderBottomLeftRadius: '85px',
                  borderBottomRightRadius: '85px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                  {/* Lunula */}
                  <div style={{
                    position: 'absolute',
                    bottom: '-15px',
                    width: '100px',
                    height: '50px',
                    backgroundColor: 'rgba(255, 255, 255, 0.7)',
                    borderRadius: '50px 50px 0 0',
                    filter: 'blur(1px)'
                  }} />

                  {/* Subtle vertical nail lines */}
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    background: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(0,0,0,0.02) 11px)',
                    pointerEvents: 'none'
                  }} />

                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    zIndex: 1,
                    padding: '20px',
                    color: '#2d3436',
                    textShadow: '0 1px 2px rgba(255,255,255,0.8)'
                  }}>
                    <span style={{ 
                      fontSize: '14px', 
                      textTransform: 'uppercase', 
                      letterSpacing: '2px', 
                      fontWeight: '600',
                      marginBottom: '4px',
                      opacity: 0.7
                    }}>{isObservationPhase ? 'Ich kaue' : 'Ich möchte'}</span>
                    <span style={{ 
                      fontSize: '28px', 
                      fontWeight: '900', 
                      textAlign: 'center',
                      lineHeight: '1.1'
                    }}>{isObservationPhase ? <><br/>GERADE NÄGEL</> : <><br/>NÄGEL KAUEN</>}</span>
                  </div>
                </div>
              </button>

              {/* Cuticle / Eponychium */}
              <div style={{
                position: 'absolute',
                bottom: '110px',
                width: '210px',
                height: '25px',
                backgroundColor: '#d8a48f',
                borderRadius: '100px 100px 0 0',
                boxShadow: '0 -5px 10px rgba(0,0,0,0.05)',
                borderTop: '1px solid rgba(0,0,0,0.05)'
              }} />
            </div>
          ) : (
            <View style={styles.finger}>
              <View style={styles.fingerCrease} />
              <Pressable
                style={({ pressed }) => [
                  styles.nailContainer,
                  pressed && { transform: [{ scale: 0.98 }] }
                ]}
                onPress={() => setShowTriggers(true)}
              >
                <View style={styles.nailBody}>
                  <View style={styles.lunula} />
                  <View style={styles.nailTexture} />
                  <View style={styles.textContainer}>
                    <Text style={styles.subText}>{isObservationPhase ? 'ICH KAUE' : 'ICH MÖCHTE'}</Text>
                    <Text style={styles.mainText}>{isObservationPhase ? 'GERADE\nNÄGEL' : 'NÄGEL\nKAUEN'}</Text>
                  </View>
                </View>
              </Pressable>
              <View style={styles.cuticle} />
            </View>
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

  if (Platform.OS === 'web') {
    return content;
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      {content}
    </TouchableWithoutFeedback>
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
  finger: {
    width: 300,
    height: 420,
    backgroundColor: '#d8a48f',
    borderRadius: 150,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    alignItems: 'center',
    paddingTop: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 10,
    position: 'relative',
  },
  fingerCrease: {
    position: 'absolute',
    bottom: 100,
    width: 180,
    height: 1.5,
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 3,
  },
  nailContainer: {
    backgroundColor: '#ffffff', // The white tip
    width: 210,
    height: 280,
    borderTopLeftRadius: 105,
    borderTopRightRadius: 105,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  nailBody: {
    position: 'absolute',
    top: 25,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8e3df',
    borderTopLeftRadius: 90, // Concave effect
    borderTopRightRadius: 90,
    borderBottomLeftRadius: 85,
    borderBottomRightRadius: 85,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lunula: {
    position: 'absolute',
    bottom: -15,
    width: 100,
    height: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
  nailTexture: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.05,
    // Note: React Native doesn't support gradients natively without expo-linear-gradient
    // This is a placeholder for texture
  },
  cuticle: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: 130,
    backgroundColor: '#d8a48f',
    borderTopLeftRadius: 110,
    borderTopRightRadius: 110,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    zIndex: 2,
  },
  textContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  subText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    letterSpacing: 2,
    marginBottom: 4,
    opacity: 0.7,
  },
  mainText: {
    fontSize: 28,
    fontWeight: '900',
    color: '#2d3436',
    textAlign: 'center',
    lineHeight: 30,
  },
  timerBadge: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 20,
    marginTop: 60,
    marginHorizontal: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  timerText: {
    fontSize: 14,
    color: '#636e72',
  },
  batchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(245, 247, 250, 0.98)',
    zIndex: 2000,
    justifyContent: 'center',
    padding: 20,
  },
  batchCard: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  batchSubtitle: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  batchItem: {
    width: '100%',
  },
  batchTriggerLabel: {
    fontSize: 18,
    color: '#2d3436',
    marginBottom: 10,
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
  batchOverlay_web: {
    // Shared with mobile through styles.batchOverlay
  }
});
