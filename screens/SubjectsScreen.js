import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { saveData, loadData } from '../storage/storage';

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#e91e63'];

export default function SubjectsScreen() {
  const [subjects, setSubjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  useEffect(() => {
    loadData('subjects').then(data => {
      if (data) setSubjects(data);
    });
  }, []);

  const addSubject = async () => {
    if (!newSubject.trim()) return;
    const subject = {
      id: Date.now().toString(),
      name: newSubject.trim(),
      color: selectedColor,
    };
    const updated = [...subjects, subject];
    setSubjects(updated);
    await saveData('subjects', updated);
    setNewSubject('');
    setSelectedColor(COLORS[0]);
    setModalVisible(false);
  };

  const deleteSubject = async (id) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    await saveData('subjects', updated);
  };

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
              <TouchableOpacity onPress={() => deleteSubject(item.id)}>
                <Text style={styles.delete}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modal}>
            <Text style={styles.modalTitle}>Add Subject</Text>

            <TextInput
              style={styles.input}
              placeholder="Subject name"
              value={newSubject}
              onChangeText={setNewSubject}
              autoFocus
            />

            <Text style={styles.colorLabel}>Pick a color:</Text>
            <View style={styles.colorRow}>
              {COLORS.map(color => (
                <TouchableOpacity
                  key={color}
                  style={[styles.colorDot, { backgroundColor: color },
                    selectedColor === color && styles.colorDotSelected]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={addSubject}>
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a2e', marginTop: 20, marginBottom: 30 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#888' },
  emptySubText: { fontSize: 14, color: '#aaa', marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16, borderLeftWidth: 5, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subjectName: { fontSize: 18, fontWeight: '600', color: '#1a1a2e' },
  delete: { fontSize: 18, color: '#aaa' },
  fab: { position: 'absolute', bottom: 30, right: 30, backgroundColor: '#1a1a2e', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 30, paddingBottom: 40 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 20 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 20 },
  colorLabel: { fontSize: 14, color: '#888', marginBottom: 12 },
  colorRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: '#1a1a2e' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#1a1a2e', alignItems: 'center' },
  cancelText: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  addBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#1a1a2e', alignItems: 'center' },
  addText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});