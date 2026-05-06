import { useStore } from '@/store/useStore';
import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { format, isSameDay, subDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { useTheme } from '@/hooks/useTheme';

export default function PatternsScreen() {
  const { events } = useStore();
  const insets = useSafeAreaInsets();
  const [isExpanded, setIsExpanded] = useState(false);
  const t = useTheme();

  const totalEvents = events.length;
  const replacedEvents = events.filter(e => e.replaced).length;
  const replacedPercentage = totalEvents > 0 ? Math.round((replacedEvents / totalEvents) * 100) : 0;

  const triggerStats = events.reduce((acc, event) => {
    if (!acc[event.trigger]) {
      acc[event.trigger] = { total: 0, replaced: 0 };
    }
    acc[event.trigger].total++;
    if (event.replaced) acc[event.trigger].replaced++;
    return acc;
  }, {} as Record<string, { total: number; replaced: number }>);

  const allSortedTriggers = Object.entries(triggerStats)
    .sort(([, a], [, b]) => b.total - a.total);

  const sortedTriggers = isExpanded ? allSortedTriggers : allSortedTriggers.slice(0, 3);
  const maxTriggerCount = Math.max(...allSortedTriggers.map(([, s]) => s.total), 1);

  const last7Days = [...Array(7)].map((_, i) => {
    const date = subDays(new Date(), i);
    const dayEvents = events.filter(e => isSameDay(new Date(e.timestamp), date));
    const replaced = dayEvents.filter(e => e.replaced).length;
    const total = dayEvents.length;
    return {
      date,
      dayName: i === 0 ? 'Heute' : format(date, 'EEE', { locale: de }),
      total,
      replaced,
      notReplaced: total - replaced
    };
  }).reverse();

  const maxCount = Math.max(...last7Days.map(d => d.total), 1);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: t.bg }]}
      contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 20) + 10 }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: t.text }]}>Deine Muster</Text>
        <Text style={[styles.subtitle, { color: t.textSub }]}>Erst verstehen, dann verändern.</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={[styles.statCard, { backgroundColor: t.bgCard }]}>
          <Text style={styles.statValue}>{totalEvents}</Text>
          <Text style={[styles.statLabel, { color: t.textSub }]}>Erfasst gesamt</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: t.bgCard }]}>
          <Text style={styles.statValue}>{replacedPercentage}%</Text>
          <Text style={[styles.statLabel, { color: t.textSub }]}>Ersetzt</Text>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: t.bgCard }]}>
        <Text style={[styles.sectionTitle, { color: t.text }]}>Häufigste Trigger</Text>
        {events.length === 0 ? (
          <Text style={[styles.emptyText, { color: t.textMuted }]}>Noch keine Daten vorhanden. Logge deinen ersten Moment!</Text>
        ) : (
          sortedTriggers.map(([trigger, stats]) => {
            const percentageTotal = Math.round((stats.total / totalEvents) * 100);
            const percentageReplaced = (stats.replaced / stats.total) * 100;
            const percentageNotReplaced = 100 - percentageReplaced;
            return (
              <View key={trigger} style={styles.triggerRow}>
                <View style={styles.triggerInfo}>
                  <Text style={[styles.triggerName, { color: t.text }]}>{trigger}</Text>
                  <Text style={[styles.triggerCount, { color: t.textSub }]}>{stats.total}x ({percentageTotal}%)</Text>
                </View>
                <View style={[
                  styles.progressBarBg,
                  { backgroundColor: t.bgSubtle, width: `${(Math.log(stats.total + 1) / Math.log(maxTriggerCount + 1)) * 100}%` }
                ]}>
                  <View style={[styles.progressBarFill, { width: `${percentageReplaced}%`, backgroundColor: '#8fd8a4' }]} />
                  <View style={[styles.progressBarFill, { width: `${percentageNotReplaced}%`, backgroundColor: '#fab1a0' }]} />
                </View>
              </View>
            );
          })
        )}
        {allSortedTriggers.length > 3 && (
          <TouchableOpacity
            style={[styles.expandButton, { borderTopColor: t.border }]}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={[styles.expandButtonText, { color: t.textMuted }]}>
              {isExpanded ? 'Weniger anzeigen' : `${allSortedTriggers.length - 3} weitere anzeigen`}
            </Text>
            {isExpanded
              ? <ChevronUp size={16} color={t.textMuted} />
              : <ChevronDown size={16} color={t.textMuted} />
            }
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: t.bgCard, marginTop: 20 }]}>
        <Text style={[styles.sectionTitle, { color: t.text }]}>Verlauf (7 Tage)</Text>
        <View style={styles.chartContainer}>
          {last7Days.map((day, index) => (
            <View key={index} style={styles.chartBarWrapper}>
              <View style={styles.chartBarContainer}>
                <View style={[
                  styles.chartBarOuter,
                  { backgroundColor: t.bgSubtle, height: `${Math.max((day.total / maxCount) * 100, 2)}%` }
                ]}>
                  {day.total > 0 ? (
                    <>
                      <View style={{ height: `${(day.notReplaced / day.total) * 100}%`, backgroundColor: '#fab1a0' }} />
                      <View style={{ height: `${(day.replaced / day.total) * 100}%`, backgroundColor: '#8fd8a4' }} />
                    </>
                  ) : null}
                </View>
              </View>
              <Text style={[styles.chartLabel, { color: t.textMuted }]}>{day.dayName}</Text>
              <Text style={[styles.chartValue, { color: t.text }]}>{day.total}</Text>
            </View>
          ))}
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#8fd8a4' }]} />
            <Text style={[styles.legendText, { color: t.textSub }]}>Ersetzt</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#fab1a0' }]} />
            <Text style={[styles.legendText, { color: t.textSub }]}>Ignoriert / Kaue</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16 },
  statsGrid: { flexDirection: 'row', gap: 15, marginBottom: 30 },
  statCard: {
    flex: 1, padding: 20, borderRadius: 15, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  statValue: { fontSize: 32, fontWeight: 'bold', color: '#8fd8a4', marginBottom: 5 },
  statLabel: { fontSize: 14 },
  section: {
    padding: 20, borderRadius: 15,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 5, elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  emptyText: { fontStyle: 'italic', textAlign: 'center', padding: 20 },
  triggerRow: { marginBottom: 15 },
  triggerInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  triggerName: { fontSize: 16, fontWeight: '500' },
  triggerCount: { fontSize: 14 },
  progressBarBg: { height: 8, borderRadius: 4, overflow: 'hidden', flexDirection: 'row' },
  progressBarFill: { height: '100%' },
  chartContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 150, marginTop: 10 },
  chartBarWrapper: { alignItems: 'center', flex: 1 },
  chartBarContainer: { height: 100, width: '100%', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 8 },
  chartBarOuter: { width: 12, borderRadius: 6, overflow: 'hidden', flexDirection: 'column' },
  chartLabel: { fontSize: 10, marginBottom: 2 },
  chartValue: { fontSize: 12, fontWeight: 'bold' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 12 },
  expandButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 10, paddingVertical: 10, borderTopWidth: 1 },
  expandButtonText: { fontSize: 14, fontWeight: '500' },
});
