import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.greeting}>Good day 👋</Text>
      <Text style={styles.appName}>Planotion</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Today's Goal</Text>
        <Text style={styles.cardValue}>0 hours studied</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔥 Streak</Text>
        <Text style={styles.cardValue}>0 days</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📚 Subjects</Text>
        <Text style={styles.cardValue}>No subjects yet</Text>
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
  cardValue: { fontSize: 20, fontWeight: '600', color: '#1a1a2e' },
}); 