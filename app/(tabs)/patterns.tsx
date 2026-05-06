import { StyleSheet, View, Text, ScrollView } from 'react-native';
import { useStore, AppEvent } from '@/store/useStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PatternsScreen() {
  const { events } = useStore();
  const insets = useSafeAreaInsets();

  const totalEvents = events.length;
  const replacedEvents = events.filter(e => e.replaced).length;
  const replacedPercentage = totalEvents > 0 ? Math.round((replacedEvents / totalEvents) * 100) : 0;

  // Calculate top triggers
  const triggerCounts = events.reduce((acc, event) => {
    acc[event.trigger] = (acc[event.trigger] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedTriggers = Object.entries(triggerCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3); // Top 3

  return (
    <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Deine Muster</Text>
        <Text style={styles.subtitle}>
          Erst verstehen, dann verändern.
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalEvents}</Text>
          <Text style={styles.statLabel}>Erfasst gesamt</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{replacedPercentage}%</Text>
          <Text style={styles.statLabel}>Ersetzt</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Häufigste Trigger</Text>
        {events.length === 0 ? (
          <Text style={styles.emptyText}>Noch keine Daten vorhanden. Logge deinen ersten Moment!</Text>
        ) : (
          sortedTriggers.map(([trigger, count], index) => {
            const percentage = Math.round((count / totalEvents) * 100);
            return (
              <View key={trigger} style={styles.triggerRow}>
                <View style={styles.triggerInfo}>
                  <Text style={styles.triggerName}>{trigger}</Text>
                  <Text style={styles.triggerCount}>{count}x ({percentage}%)</Text>
                </View>
                <View style={styles.progressBarBg}>
                  <View 
                    style={[
                      styles.progressBarFill, 
                      { width: `${percentage}%`, backgroundColor: index === 0 ? '#8fd8a4' : 'rgba(143,216,164,0.35)' }
                    ]} 
                  />
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  content: {
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
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 30,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8fd8a4',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#636e72',
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 20,
  },
  emptyText: {
    color: '#a4b0be',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 20,
  },
  triggerRow: {
    marginBottom: 15,
  },
  triggerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  triggerName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2d3436',
  },
  triggerCount: {
    fontSize: 14,
    color: '#636e72',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#f1f2f6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
});
