import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { loadData, saveData } from '../storage/storage';

export default function StatsScreen() {
  const [sessions, setSessions] = useState([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);

  useEffect(() => {
    loadData('sessions').then(data => {
      if (data) {
        setSessions(data.reverse());
        const total = data.reduce((sum, s) => sum + s.duration, 0);
        setTotalMinutes(total);
        const today = new Date().toDateString();
        const todayTotal = data
          .filter(s => new Date(s.date).toDateString() === today)
          .reduce((sum, s) => sum + s.duration, 0);
        setTodayMinutes(todayTotal);
      }
    });
  }, []);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekData = days.map((day, i) => {
    const dayIndex = i === 6 ? 0 : i + 1;
    const total = sessions
      .filter(s => new Date(s.date).getDay() === dayIndex)
      .reduce((sum, s) => sum + s.duration, 0);
    return { day, total };
  });
  const maxHours = Math.max(...weekData.map(d => d.total), 1);

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const clearSessions = async () => {
    await saveData('sessions', []);
    setSessions([]);
    setTotalMinutes(0);
    setTodayMinutes(0);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>My Stats</Text>

      <View style={styles.row}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{todayMinutes}m</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{Math.round(totalMinutes / 60)}h</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{sessions.length}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>This Week</Text>
        <View style={styles.chart}>
          {weekData.map(({ day, total }) => (
            <View key={day} style={styles.barContainer}>
              <Text style={styles.barValue}>{total > 0 ? `${total}m` : ''}</Text>
              <View style={[styles.bar, {
                height: Math.max((total / maxHours) * 100, 4),
                backgroundColor: total > 0 ? '#1a1a2e' : '#eee'
              }]} />
              <Text style={styles.barLabel}>{day}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Recent Sessions</Text>
        {sessions.length === 0 ? (
          <Text style={styles.empty}>No sessions yet — start the timer!</Text>
        ) : (
          sessions.slice(0, 10).map(session => (
            <View key={session.id} style={styles.sessionRow}>
              <View style={[styles.sessionDot, { backgroundColor: session.color }]} />
              <View style={styles.sessionInfo}>
                <Text style={styles.sessionSubject}>{session.subject}</Text>
                <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
              </View>
              <Text style={styles.sessionDuration}>{session.duration}m</Text>
            </View>
          ))
        )}
      </View>

      {sessions.length > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={clearSessions}>
          <Text style={styles.clearBtnText}>Clear All Sessions</Text>
        </TouchableOpacity>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a2e', marginTop: 20, marginBottom: 30 },
  row: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1a1a2e' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 14, color: '#888', marginBottom: 16 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 140 },
  barContainer: { alignItems: 'center', flex: 1 },
  barValue: { fontSize: 9, color: '#888', marginBottom: 4 },
  bar: { width: 28, borderRadius: 8, marginBottom: 8 },
  barLabel: { fontSize: 11, color: '#888' },
  empty: { fontSize: 14, color: '#aaa', textAlign: 'center', paddingVertical: 20 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  sessionDot: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
  sessionInfo: { flex: 1 },
  sessionSubject: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  sessionDate: { fontSize: 12, color: '#aaa', marginTop: 2 },
  sessionDuration: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  clearBtn: { backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 30, borderWidth: 1, borderColor: '#e74c3c' },
  clearBtnText: { color: '#e74c3c', fontSize: 15, fontWeight: '600' },
});