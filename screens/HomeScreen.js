import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import { loadData } from '../storage/storage';
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const [subjects, setSubjects] = useState([]);
  const [totalSessions, setTotalSessions] = useState(0);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadData('subjects').then(data => { if (data) setSubjects(data); });
    loadData('sessions').then(data => {
      if (data) {
        setTotalSessions(data.length);
        setTotalMinutes(data.reduce((sum, s) => sum + s.duration, 0));
      }
    });
    loadData('tasks').then(data => { if (data) setTasks(data); });
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const pendingTasks = tasks.filter(t => !t.completed).length;
  const todaySessions = totalSessions;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

      {/* Header */}
      <LinearGradient
        colors={['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()} 👋</Text>
        <Text style={styles.appName}>Planotion</Text>
        <Text style={styles.subtitle}>Your study companion</Text>

        {/* Quick Stats Row */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{subjects.length}</Text>
            <Text style={styles.quickStatLabel}>Subjects</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{totalSessions}</Text>
            <Text style={styles.quickStatLabel}>Sessions</Text>
          </View>
          <View style={styles.quickStatDivider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{Math.round(totalMinutes / 60)}h</Text>
            <Text style={styles.quickStatLabel}>Studied</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>

        {/* Pending Tasks Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>✅</Text>
            <Text style={styles.cardTitle}>Pending Tasks</Text>
          </View>
          {pendingTasks === 0 ? (
            <Text style={styles.cardEmpty}>All tasks completed! 🎉</Text>
          ) : (
            <>
              <Text style={styles.cardValue}>{pendingTasks} task{pendingTasks !== 1 ? 's' : ''} remaining</Text>
              {tasks.filter(t => !t.completed).slice(0, 3).map(task => (
                <View key={task.id} style={styles.taskPreview}>
                  <View style={[styles.taskDot, { backgroundColor: task.subject?.color || '#ccc' }]} />
                  <Text style={styles.taskPreviewText} numberOfLines={1}>{task.title}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* Subjects Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>📚</Text>
            <Text style={styles.cardTitle}>My Subjects</Text>
          </View>
          {subjects.length === 0 ? (
            <Text style={styles.cardEmpty}>No subjects yet — add one!</Text>
          ) : (
            <View style={styles.subjectGrid}>
              {subjects.map(s => (
                <View key={s.id} style={[styles.subjectChip, { backgroundColor: s.color + '18', borderColor: s.color + '44' }]}>
                  <View style={[styles.subjectChipDot, { backgroundColor: s.color }]} />
                  <Text style={[styles.subjectChipText, { color: s.color }]}>{s.name}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Study Tip Card */}
        <LinearGradient
          colors={['#0f3460', '#533483']}
          style={styles.tipCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <Text style={styles.tipIcon}>💡</Text>
          <Text style={styles.tipTitle}>Study Tip</Text>
          <Text style={styles.tipText}>
            Use the Pomodoro technique — 25 minutes of focused study followed by a 5 minute break — to maximize your productivity.
          </Text>
        </LinearGradient>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9ff' },
  header: { padding: 28, paddingTop: 60, paddingBottom: 36, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  greeting: { fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  appName: { fontSize: 36, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 28 },
  quickStats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 16 },
  quickStat: { flex: 1, alignItems: 'center' },
  quickStatValue: { fontSize: 24, fontWeight: '700', color: '#fff' },
  quickStatLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 },
  quickStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  body: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: '#1a1a2e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.06, shadowRadius: 16, elevation: 4 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14, gap: 8 },
  cardIcon: { fontSize: 20 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e' },
  cardValue: { fontSize: 15, color: '#666', marginBottom: 12 },
  cardEmpty: { fontSize: 14, color: '#aaa', fontStyle: 'italic' },
  taskPreview: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  taskDot: { width: 8, height: 8, borderRadius: 4 },
  taskPreviewText: { fontSize: 14, color: '#555', flex: 1 },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subjectChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  subjectChipDot: { width: 8, height: 8, borderRadius: 4 },
  subjectChipText: { fontSize: 13, fontWeight: '600' },
  tipCard: { borderRadius: 24, padding: 20, marginBottom: 30 },
  tipIcon: { fontSize: 24, marginBottom: 8 },
  tipTitle: { fontSize: 16, fontWeight: '700', color: '#fff', marginBottom: 8 },
  tipText: { fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 22 },
});