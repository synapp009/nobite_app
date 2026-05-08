import { useTheme } from '@/hooks/useTheme';
import { Trigger, useStore } from '@/store/useStore';
import { Check, Plus, X, Calendar, ChevronRight } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, FlatList, Keyboard, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DEFAULT_TRIGGERS: Trigger[] = ['Stress', 'Langeweile', 'Grübeln', 'Müdigkeit'];

const BittenNail = ({ width, height, pulseAnim }: { width: number, height: number, pulseAnim?: any }) => {
  return (
    <Animated.View style={{ width, height, transform: [{ scale: pulseAnim || 1 }] }}>
      <Svg width="100%" height="100%" viewBox="0 0 100 130" preserveAspectRatio="none">
        <Defs>
          <LinearGradient id="nailGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#f8e3df" />
            <Stop offset="1" stopColor="#f3ccc3" />
          </LinearGradient>
        </Defs>
        <Path
          d="M 0 30 L 12 27 L 22 32 L 32 25 L 42 33 L 55 28 L 68 35 L 78 27 L 88 32 L 100 28 L 100 95 C 100 120 80 130 50 130 C 20 130 0 120 0 95 Z"
          fill="white"
        />
        <Path
          d="M 4 38 L 14 35 L 24 40 L 34 33 L 44 41 L 56 35 L 68 42 L 78 34 L 88 39 L 96 38 L 96 95 C 96 115 75 125 50 125 C 25 125 4 115 4 95 Z"
          fill="url(#nailGrad)"
        />
        <Path
          d="M 30 130 C 30 110 70 110 70 130 Z"
          fill="rgba(255, 255, 255, 0.7)"
        />
        <Path
          d="M 0 30 L 12 27 L 22 32 L 32 25 L 42 33 L 55 28 L 68 35 L 78 27 L 88 32 L 100 28"
          fill="none"
          stroke="#ff7675"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <Path d="M 22 32 L 24 34" stroke="#d63031" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
        <Path d="M 68 35 L 70 37" stroke="#d63031" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      </Svg>
    </Animated.View>
  );
};

export default function LogScreen() {
  const [showTriggers, setShowTriggers] = useState(false);
  const [intervention, setIntervention] = useState<{ trigger: Trigger; action: string; eventId: string } | null>(null);
  const [isCustomTrigger, setIsCustomTrigger] = useState(false);
  const [customTriggerText, setCustomTriggerText] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const flatListRef = useRef<any>(null);
  const insets = useSafeAreaInsets();
  const t = useTheme();

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const {
    events,
    logEvent,
    firstLaunchAt,
    initFirstLaunch,
    replacements,
    setReplacement,
    debugSetFirstLaunch,
    hasCompletedOnboarding,
    setHasCompletedOnboarding,
    markAsReplaced,
    resetStore
  } = useStore();

  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const [listWidth, setListWidth] = useState(screenWidth);

  const slides = [
    {
      title: "Willkommen bei NoBite",
      description: "Der erste Schritt in ein Leben ohne Nägelkauen beginnt heute. Wir begleiten dich mit wissenschaftlich fundierten Methoden.",
      icon: "",
      color: t.accentMuted
    },
    {
      title: "Phase 1: Beobachten",
      description: "In den ersten 7 Tagen lernst du deine Auslöser kennen. Tippe auf den Nagel, jedes Mal wenn du den Drang spürst.",
      icon: "",
      color: t.accent
    },
    {
      title: "Phase 2: Verändern",
      description: "Nach der Beobachtung helfen wir dir, das Kauen durch gesunde Ersatzhandlungen zu ersetzen. Gemeinsam schaffen wir das!",
      icon: "",
      color: "#F4A7A7"
    }
  ];

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

  const handleFinishOnboarding = () => {
    setHasCompletedOnboarding(true);
    initFirstLaunch();
  };

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
      const { trigger, eventId } = pendingReplacement;
      setReplacement(trigger, action);
      setPendingReplacement(null);

      // Wait a bit to ensure states are updated correctly
      setTimeout(() => {
        setIntervention({
          trigger,
          action,
          eventId
        });
      }, 0);
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
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: t.bg }]}>
      {/* 0. Timer / Status UI - Only show on main screen */}
      {!intervention && !showTriggers && !pendingReplacement && !showBatchSetup && !showSuccess && (
        <View style={styles.statusContainer}>
          {isObservationPhase ? (
            <View style={[styles.designCard, { backgroundColor: t.accent }]}>
              <View style={styles.designCardContent}>
                <View style={styles.designCardIconWrap}>
                  <Calendar size={24} color={t.accent} />
                </View>
                <View style={styles.designCardTextWrap}>
                  <Text style={styles.designCardTitle}>Noch {daysRemaining} {daysRemaining === 1 ? 'Tag' : 'Tage'}</Text>
                  <Text style={styles.designCardSubtitle}>Beobachtungsphase</Text>
                </View>
                <ChevronRight size={24} color="rgba(255,255,255,0.7)" />
              </View>
            </View>
          ) : (
            <View style={[styles.designCard, { backgroundColor: t.bgCard }]}>
              <View style={styles.designCardContent}>
                <View style={[styles.designCardIconWrap, { backgroundColor: t.accentBg }]}>
                  <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: t.accent, shadowColor: t.accent, shadowOpacity: 0.8, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } }} />
                </View>
                <View style={styles.designCardTextWrap}>
                  <Text style={[styles.designCardTitle, { color: t.text }]}>Intervention</Text>
                  <Text style={[styles.designCardSubtitle, { color: t.accent }]}>Phase aktiv</Text>
                </View>
                <ChevronRight size={24} color={t.border} />
              </View>
            </View>
          )}

          {/* Subtle Debug Controls */}
          <View style={styles.debugContainer}>
            <TouchableOpacity onPress={() => debugSetFirstLaunch(Date.now() - 8 * 24 * 60 * 60 * 1000)}>
              <Text style={styles.debugLink}>Phase überspringen</Text>
            </TouchableOpacity>
            <View style={styles.debugSeparator} />
            <TouchableOpacity onPress={resetStore}>
              <Text style={[styles.debugLink, { color: '#fab1a0' }]}>App Reset</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 0.5 Batch Setup UI (Global Popup) */}
      {showBatchSetup && !pendingReplacement && !intervention && !showTriggers && !showSuccess && (

        <View style={[styles.content, styles.batchOverlay, { backgroundColor: t.isDark ? 'rgba(17,20,24,0.98)' : 'rgba(245,247,250,0.98)' }]}>
          <View style={[styles.batchCard, { backgroundColor: t.bgCard }]}>
            <Text style={[styles.modalTitle, { color: t.text }]}>Setze deine Strategien</Text>
            <Text style={styles.batchSubtitle}>
              Die Beobachtung ist vorbei! Lege für jedes Muster eine Ersatzhandlung fest.
              ({triggersToFix.length} verbleibend)
            </Text>

            <View style={styles.batchItem}>
              <Text style={[styles.batchTriggerLabel, { color: t.textSub }]}>Wenn ich <Text style={{ fontWeight: 'bold', color: t.text }}>{currentBatchTrigger}</Text> fühle...</Text>
              <TextInput
                style={[styles.customInput, { backgroundColor: t.bgInput, color: t.text }]}
                placeholder="Meine Ersatzhandlung..."
                placeholderTextColor={t.textMuted}
                value={batchInput}
                onChangeText={setBatchInput}
                autoFocus
              />
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: t.accent, marginTop: 15 }]}
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

        <View style={[styles.content, { padding: 20, backgroundColor: t.bg }]}>
          <Text style={[styles.interventionTitle, { color: t.textSub }]}>Statt Nägelkauen ({intervention.trigger}):</Text>
          <Text style={[styles.interventionAction, { color: t.accent }]}>{intervention.action}</Text>

          <View style={styles.interventionActions}>
            <Pressable
              style={[styles.actionButton, { backgroundColor: t.accent, flex: 1 }]}
              onPress={handleInterventionDone}
            >
              <Check color="white" size={24} />
              <Text style={styles.actionButtonText}>Gemacht</Text>
            </Pressable>

            <Pressable
              style={[styles.actionButton, { backgroundColor: '#F4A7A7', flex: 1 }]}
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
        <View style={[styles.content, styles.batchOverlay, { backgroundColor: t.isDark ? 'rgba(17,20,24,0.98)' : 'rgba(245,247,250,0.98)' }]}>
          <View style={styles.batchCard}>
            <Text style={[styles.modalTitle, { color: t.text }]}>Setze deine Strategie</Text>
            <Text style={[styles.batchSubtitle, { color: t.textSub }]}>
              Lege für dein neues Muster direkt eine Ersatzhandlung fest.
            </Text>

            <View style={styles.batchItem}>
              <Text style={[styles.batchTriggerLabel, { color: t.textSub }]}>
                Wenn ich <Text style={{ fontWeight: 'bold', color: t.text }}>{pendingReplacement.trigger}</Text> fühle...
              </Text>

              <TextInput
                style={[styles.customInput, { backgroundColor: t.bgInput, color: t.text }]}
                placeholder="Meine Ersatzhandlung..."
                placeholderTextColor={t.textMuted}
                value={batchInput}
                onChangeText={setBatchInput}
                autoFocus
                onSubmitEditing={() => {
                  if (batchInput.trim()) {
                    handleSaveForcedReplacement(batchInput.trim());
                    setBatchInput('');
                  }
                }}
              />

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: t.accent, marginTop: 15 }]}
                onPress={() => {
                  if (batchInput.trim()) {
                    handleSaveForcedReplacement(batchInput.trim());
                    setBatchInput('');
                  }
                }}
              >
                <Text style={styles.actionButtonText}>Speichern & Weiter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}


      {/* 2. Trigger Selection UI */}
      {!intervention && showTriggers && !pendingReplacement && !showBatchSetup && (

        <View style={[styles.content, { padding: 20, justifyContent: 'center', backgroundColor: t.bg }]}>
          <Text style={[styles.modalTitle, { color: t.text }]}>Warum?</Text>
          <View style={{ width: '100%', maxWidth: 400 }}>
            {!isCustomTrigger ? (
              <>
                {allTriggers.map(trigger => (
                  <Pressable
                    key={trigger}
                    style={({ pressed }) => [styles.triggerButton, { backgroundColor: t.bgSubtle }, pressed && { opacity: 0.8 }]}
                    onPress={() => handleTriggerSelect(trigger)}
                  >
                    <Text style={[styles.triggerText, { color: t.text }]}>{trigger}</Text>
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
                  style={[styles.customInput, { backgroundColor: t.bgInput, color: t.text }]}
                  placeholder="Dein eigener Grund..."
                  placeholderTextColor={t.textMuted}
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
                    style={({ pressed }) => [styles.actionButton, { backgroundColor: t.accent, flex: 1 }, pressed && { opacity: 0.8 }]}
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
      {!intervention && !showTriggers && !showSuccess && !pendingReplacement && !showBatchSetup && (

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
                    }}>{isObservationPhase ? <><br />GERADE NÄGEL</> : <><br />NÄGEL KAUEN</>}</span>
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
                    <Text style={[styles.subText, { color: t.textSub }]}>{isObservationPhase ? 'ICH KAUE' : 'ICH MÖCHTE'}</Text>
                    <Text style={[styles.mainText, { color: t.text }]}>{isObservationPhase ? 'GERADE\nNÄGEL' : 'NÄGEL\nKAUEN'}</Text>
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
            <View style={{ backgroundColor: t.accent, padding: 30, borderRadius: 100, marginBottom: 20 }}>
              <Check color="white" size={60} />
            </View>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: t.text }}>Gespeichert!</Text>
            <Text style={{ fontSize: 16, color: t.textSub, marginTop: 10 }}>Grund erfolgreich erfasst.</Text>
          </Animated.View>
        </View>
      )}
    </View>
  );

  if (!hasCompletedOnboarding) {
    return (
      <View style={[styles.container, { backgroundColor: t.bg, paddingTop: insets.top }]}>
        <FlatList
          ref={flatListRef}
          style={{ flex: 1 }}
          data={slides}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onLayout={(e) => {
            setListWidth(e.nativeEvent.layout.width);
          }}
          onScroll={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / listWidth);
            if (index !== onboardingIndex) setOnboardingIndex(index);
          }}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / listWidth);
            setOnboardingIndex(index);
          }}
          getItemLayout={(_, index) => ({
            length: listWidth,
            offset: listWidth * index,
            index,
          })}
          scrollEventThrottle={16}

          renderItem={({ item, index }) => (
            <View style={{ width: listWidth, height: screenHeight - 160, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40, paddingBottom: 40 }}>

              {index === 1 ? (
                <View style={{ marginBottom: 32, alignItems: 'center' }}>
                  {/* Phase 1: Bitten nail - proportionally scaled from main screen */}
                  <View style={{
                    width: 150,
                    height: 210,
                    backgroundColor: '#d8a48f',
                    borderTopLeftRadius: 75,
                    borderTopRightRadius: 75,
                    borderBottomLeftRadius: 7,
                    borderBottomRightRadius: 7,
                    alignItems: 'center',
                    paddingTop: 15,
                    position: 'relative',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 8,
                  }}>
                    {/* Finger crease */}
                    <View style={{ position: 'absolute', bottom: 50, width: 90, height: 1, backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 3 }} />
                    <BittenNail width={105} height={140} pulseAnim={pulseAnim} />
                    {/* Cuticle */}
                    <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 65, backgroundColor: '#d8a48f', borderTopLeftRadius: 55, borderTopRightRadius: 55, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', zIndex: 2 }} />
                  </View>
                </View>
              ) : index === 2 ? (
                <View style={{ marginBottom: 32, alignItems: 'center' }}>
                  {/* Phase 2: Healthy nail - proportionally scaled from main screen */}
                  <View style={{
                    width: 150,
                    height: 210,
                    backgroundColor: '#d8a48f',
                    borderTopLeftRadius: 75,
                    borderTopRightRadius: 75,
                    borderBottomLeftRadius: 7,
                    borderBottomRightRadius: 7,
                    alignItems: 'center',
                    paddingTop: 15,
                    position: 'relative',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 5 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                    elevation: 8,
                  }}>
                    {/* Finger crease */}
                    <View style={{ position: 'absolute', bottom: 50, width: 90, height: 1, backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 3 }} />
                    {/* Nail container (white tip) */}
                    <View style={{ backgroundColor: '#ffffff', width: 105, height: 140, borderTopLeftRadius: 52, borderTopRightRadius: 52, borderBottomLeftRadius: 45, borderBottomRightRadius: 45, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
                      {/* Nail body */}
                      <View style={{ position: 'absolute', top: 12, left: 0, right: 0, bottom: 0, backgroundColor: '#f8e3df', borderTopLeftRadius: 45, borderTopRightRadius: 45, borderBottomLeftRadius: 42, borderBottomRightRadius: 42, justifyContent: 'center', alignItems: 'center' }}>
                        {/* Lunula */}
                        <View style={{ position: 'absolute', bottom: -7, width: 50, height: 25, backgroundColor: 'rgba(255,255,255,0.7)', borderTopLeftRadius: 25, borderTopRightRadius: 25 }} />
                      </View>
                    </View>
                    {/* Cuticle */}
                    <View style={{ position: 'absolute', bottom: 0, width: '100%', height: 65, backgroundColor: '#d8a48f', borderTopLeftRadius: 55, borderTopRightRadius: 55, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.1)', zIndex: 2 }} />
                    {/* Sparkles removed */}
                  </View>
                </View>
              ) : (
                item.icon ? <Text style={{ fontSize: 80, marginBottom: 32 }}>{item.icon}</Text> : null
              )}
              <Text style={[styles.modalTitle, { fontSize: 28, marginBottom: 16, textAlign: 'center' }]}>{item.title}</Text>
              <Text style={{ fontSize: 17, textAlign: 'center', color: '#636e72', lineHeight: 26 }}>{item.description}</Text>
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
        />
        <View style={{ position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 30 }}>
            {slides.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === onboardingIndex ? 25 : 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: i === onboardingIndex ? '#2d3436' : '#dfe6e9'
                }}
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: t.accent, width: screenWidth - 80, height: 60 }]}
            onPress={() => {
              if (onboardingIndex < slides.length - 1) {
                flatListRef.current?.scrollToIndex({ index: onboardingIndex + 1, animated: true });
              } else {
                handleFinishOnboarding();
              }
            }}
          >
            <Text style={[styles.actionButtonText, { fontSize: 18 }]}>
              {onboardingIndex === slides.length - 1 ? 'Loslegen' : 'Weiter'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
  statusContainer: {
    position: 'absolute',
    top: 110,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 100,
  },
  timerBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  designCard: {
    width: '90%',
    maxWidth: 380,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  designCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  designCardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  designCardTextWrap: {
    flex: 1,
  },
  designCardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  designCardSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '500',
  },
  activePhaseBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(143,216,164,0.3)',
  },
  timerText: {
    fontSize: 14,
    color: '#2d3436',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  debugContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    opacity: 0.4,
  },
  debugLink: {
    fontSize: 10,
    color: '#636e72',
    padding: 5,
  },
  debugSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#dfe6e9',
    marginHorizontal: 5,
  },
  batchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
    justifyContent: 'center',
    padding: 20,
  },
  batchCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 30,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
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
  actionButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  customInput: {
    backgroundColor: '#EBF2FA',
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
