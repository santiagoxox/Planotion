import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function StatsScreen() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = [2, 4, 1, 3, 5, 2, 0];
  const maxHours = Math.max(...hours);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Stats</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>This Week</Text>
        <View style={styles.chart}>
          {days.map((day, i) => (
            <View key={day} style={styles.barContainer}>
              <View style={[styles.bar, {
                height: maxHours ? (hours[i] / maxHours) * 120 : 0,
                backgroundColor: hours[i] > 0 ? '#1a1a2e' : '#eee'
              }]} />
              <Text style={styles.barLabel}>{day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0h</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0h</Text>
          <Text style={styles.statLabel}>This Week</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>🔥 Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>0</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a2e', marginTop: 20, marginBottom: 30 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 14, color: '#888', marginBottom: 16 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140 },
  barContainer: { alignItems: 'center', flex: 1 },
  bar: { width: 28, borderRadius: 8, marginBottom: 8 },
  barLabel: { fontSize: 11, color: '#888' },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: 'bold', color: '#1a1a2e' },
  statLabel: { fontSize: 13, color: '#888', marginTop: 4 },
});