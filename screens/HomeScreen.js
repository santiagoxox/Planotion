import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { loadData } from '../storage/storage';

export default function HomeScreen() {
  const [subjects, setSubjects] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    loadData('subjects').then(data => {
      if (data) setSubjects(data);
    });
    loadData('sessions').then(data => {
      if (data) setTotalSessions(data.length);
    });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning ☀️';
    if (hour < 18) return 'Good afternoon 👋';
    return 'Good evening 🌙';
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>{getGreeting()}</Text>
      <Text style={styles.appName}>Planotion</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📚 Subjects</Text>
        <Text style={styles.cardValue}>{subjects.length} subject{subjects.length !== 1 ? 's' : ''}</Text>
        {subjects.slice(0, 3).map(s => (
          <View key={s.id} style={[styles.subjectTag, { backgroundColor: s.color + '22', borderLeftColor: s.color }]}>
            <Text style={[styles.subjectTagText, { color: s.color }]}>{s.name}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⏱️ Study Sessions</Text>
        <Text style={styles.cardValue}>{totalSessions} session{totalSessions !== 1 ? 's' : ''} completed</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🍅 Pomodoro</Text>
        <Text style={styles.cardValue}>25 min focus</Text>
        <Text style={styles.cardSub}>5 min break</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  greeting: { fontSize: 16, color: '#888', marginTop: 20 },
  appName: { fontSize: 32, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 30 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardTitle: { fontSize: 14, color: '#888', marginBottom: 8 },
  cardValue: { fontSize: 20, fontWeight: '600', color: '#1a1a2e', marginBottom: 8 },
  cardSub: { fontSize: 14, color: '#aaa' },
  subjectTag: { borderLeftWidth: 3, borderRadius: 8, padding: 8, marginTop: 6 },
  subjectTagText: { fontSize: 14, fontWeight: '600' },
});