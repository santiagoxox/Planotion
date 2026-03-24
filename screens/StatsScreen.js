import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { loadData, saveData } from '../storage/storage';
import { LinearGradient } from 'expo-linear-gradient';

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
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.header}>
        <Text style={styles.headerTitle}>My Stats</Text>
        <Text style={styles.headerSubtitle}>Track your progress</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{todayMinutes}m</Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{Math.round(totalMinutes / 60)}h</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{sessions.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>

        {/* Weekly Chart */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Weekly Overview</Text>
          <View style={styles.chart}>
            {weekData.map(({ day, total }) => (
              <View key={day} style={styles.barContainer}>
                <Text style={styles.barValue}>{total > 0 ? `${total}m` : ''}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.bar, {
                    height: `${Math.max((total / maxHours) * 100, 4)}%`,
                    backgroundColor: total > 0 ? '#0f3460' : '#eee'
                  }]} />
                </View>
                <Text style={styles.barLabel}>{day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Sessions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Recent Sessions</Text>
          {sessions.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🍅</Text>
              <Text style={styles.emptyText}>No sessions yet</Text>
              <Text style={styles.emptySubText}>Start the timer to log a session</Text>
            </View>
          ) : (
            sessions.slice(0, 10).map(session => (
              <View key={session.id} style={styles.sessionRow}>
                <View style={[styles.sessionColorBar, { backgroundColor: session.color }]} />
                <View style={styles.sessionInfo}>
                  <Text style={styles.sessionSubject}>{session.subject}</Text>
                  <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
                </View>
                <View style={[styles.sessionBadge, { backgroundColor: session.color + '22' }]}>
                  <Text style={[styles.sessionDuration, { color: session.color }]}>{session.duration}m</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {sessions.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={clearSessions}>
            <Text style={styles.clearBtnText}>🗑 Clear All Sessions</Text>
          </TouchableOpacity>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff' },
  header: { padding: 28, paddingTop: 60, paddingBottom: 36, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTitle: { fontSize: 32, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 24 },
  statsRow: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 16 },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '700', color: '#fff' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  body: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#1a1a2e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 20 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', height: 160, gap: 4 },
  barContainer: { flex: 1, alignItems: 'center', height: '100%', justifyContent: 'flex-end' },
  barValue: { fontSize: 9, color: '#888', marginBottom: 4 },
  barTrack: { flex: 1, width: '60%', justifyContent: 'flex-end', marginBottom: 8 },
  bar: { width: '100%', borderRadius: 6 },
  barLabel: { fontSize: 11, color: '#888' },
  empty: { alignItems: 'center', paddingVertical: 24 },
  emptyIcon: { fontSize: 36, marginBottom: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#888' },
  emptySubText: { fontSize: 13, color: '#aaa', marginTop: 4 },
  sessionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', gap: 12 },
  sessionColorBar: { width: 4, height: 40, borderRadius: 2 },
  sessionInfo: { flex: 1 },
  sessionSubject: { fontSize: 15, fontWeight: '600', color: '#1a1a2e' },
  sessionDate: { fontSize: 12, color: '#aaa', marginTop: 2 },
  sessionBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  sessionDuration: { fontSize: 13, fontWeight: '700' },
  clearBtn: { backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', marginBottom: 30, borderWidth: 1.5, borderColor: '#ffcccc' },
  clearBtnText: { color: '#e74c3c', fontSize: 15, fontWeight: '600' },
});