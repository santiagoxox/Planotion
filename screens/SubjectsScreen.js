import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useState } from 'react';

export default function SubjectsScreen() {
  const [subjects, setSubjects] = useState([]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Subjects</Text>

      {subjects.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No subjects yet</Text>
          <Text style={styles.emptySubText}>Tap + to add your first subject</Text>
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.card, { borderLeftColor: item.color }]}>
              <Text style={styles.subjectName}>{item.name}</Text>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a2e', marginTop: 20, marginBottom: 30 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#888' },
  emptySubText: { fontSize: 14, color: '#aaa', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, borderLeftWidth: 5 },
  subjectName: { fontSize: 18, fontWeight: '600', color: '#1a1a2e' },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#1a1a2e', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
});