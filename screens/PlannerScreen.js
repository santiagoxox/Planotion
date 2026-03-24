import { View, Text, StyleSheet, TouchableOpacity, FlatList, Modal, TextInput, ScrollView } from 'react-native';
import { useState, useEffect } from 'react';
import { saveData, loadData } from '../storage/storage';

const COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#e91e63'];

export default function PlannerScreen() {
  const [activeTab, setActiveTab] = useState('subjects');
  const [subjects, setSubjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState('all');

  // Modal states
  const [subjectModal, setSubjectModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [newTask, setNewTask] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState(null);
  const [newTaskDue, setNewTaskDue] = useState('');

  useEffect(() => {
    loadData('subjects').then(d => { if (d) setSubjects(d); });
    loadData('tasks').then(d => { if (d) setTasks(d); });
  }, []);

  // SUBJECTS
  const addSubject = async () => {
    if (!newSubject.trim()) return;
    const subject = { id: Date.now().toString(), name: newSubject.trim(), color: selectedColor };
    const updated = [...subjects, subject];
    setSubjects(updated);
    await saveData('subjects', updated);
    setNewSubject('');
    setSelectedColor(COLORS[0]);
    setSubjectModal(false);
  };

  const deleteSubject = async (id) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    await saveData('subjects', updated);
  };

  // TASKS
  const addTask = async () => {
    if (!newTask.trim()) return;
    const task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      subject: newTaskSubject,
      dueDate: newTaskDue.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...tasks, task];
    setTasks(updated);
    await saveData('tasks', updated);
    setNewTask('');
    setNewTaskSubject(null);
    setNewTaskDue('');
    setTaskModal(false);
  };

  const toggleTask = async (id) => {
    const updated = tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
    setTasks(updated);
    await saveData('tasks', updated);
  };

  const deleteTask = async (id) => {
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    await saveData('tasks', updated);
  };

  const filteredTasks = tasks.filter(t => {
    if (taskFilter === 'active') return !t.completed;
    if (taskFilter === 'done') return t.completed;
    return true;
  });

  const getSubjectColor = (subjectId) => {
    const s = subjects.find(s => s.id === subjectId?.id);
    return s?.color || '#ccc';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Planner</Text>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'subjects' && styles.activeTab]}
          onPress={() => setActiveTab('subjects')}>
          <Text style={[styles.tabText, activeTab === 'subjects' && styles.activeTabText]}>📚 Subjects</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tasks' && styles.activeTab]}
          onPress={() => setActiveTab('tasks')}>
          <Text style={[styles.tabText, activeTab === 'tasks' && styles.activeTabText]}>✅ Tasks</Text>
        </TouchableOpacity>
      </View>

      {/* SUBJECTS TAB */}
      {activeTab === 'subjects' && (
        <View style={styles.content}>
          {subjects.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>📚</Text>
              <Text style={styles.emptyText}>No subjects yet</Text>
              <Text style={styles.emptySubText}>Tap + to add your first subject</Text>
            </View>
          ) : (
            <FlatList
              data={subjects}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={[styles.subjectCard, { borderLeftColor: item.color }]}>
                  <View style={[styles.subjectDot, { backgroundColor: item.color }]} />
                  <Text style={styles.subjectName}>{item.name}</Text>
                  <Text style={styles.subjectTaskCount}>
                    {tasks.filter(t => t.subject?.id === item.id).length} tasks
                  </Text>
                  <TouchableOpacity onPress={() => deleteSubject(item.id)}>
                    <Text style={styles.deleteBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
          <TouchableOpacity style={styles.fab} onPress={() => setSubjectModal(true)}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <View style={styles.content}>
          {/* Filter Pills */}
          <View style={styles.filters}>
            {['all', 'active', 'done'].map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.filterPill, taskFilter === f && styles.activeFilterPill]}
                onPress={() => setTaskFilter(f)}>
                <Text style={[styles.filterText, taskFilter === f && styles.activeFilterText]}>
                  {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Done'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {filteredTasks.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>✅</Text>
              <Text style={styles.emptyText}>No tasks here</Text>
              <Text style={styles.emptySubText}>Tap + to add a task</Text>
            </View>
          ) : (
            <FlatList
              data={filteredTasks}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.taskCard}>
                  <TouchableOpacity onPress={() => toggleTask(item.id)} style={styles.checkbox}>
                    <Text style={styles.checkboxText}>{item.completed ? '✅' : '⬜'}</Text>
                  </TouchableOpacity>
                  <View style={styles.taskInfo}>
                    <Text style={[styles.taskTitle, item.completed && styles.taskDone]}>
                      {item.title}
                    </Text>
                    <View style={styles.taskMeta}>
                      {item.subject && (
                        <View style={[styles.subjectTag, { backgroundColor: item.subject.color + '22' }]}>
                          <Text style={[styles.subjectTagText, { color: item.subject.color }]}>
                            {item.subject.name}
                          </Text>
                        </View>
                      )}
                      {item.dueDate ? (
                        <Text style={styles.dueDate}>📅 {item.dueDate}</Text>
                      ) : null}
                    </View>
                  </View>
                  <TouchableOpacity onPress={() => deleteTask(item.id)}>
                    <Text style={styles.deleteBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
          <TouchableOpacity style={styles.fab} onPress={() => setTaskModal(true)}>
            <Text style={styles.fabText}>+</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ADD SUBJECT MODAL */}
      <Modal visible={subjectModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
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
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSubjectModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.addBtn} onPress={addSubject}>
                <Text style={styles.addText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ADD TASK MODAL */}
      <Modal visible={taskModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Add Task</Text>
              <TextInput
                style={styles.input}
                placeholder="Task title"
                value={newTask}
                onChangeText={setNewTask}
                autoFocus
              />
              <TextInput
                style={styles.input}
                placeholder="Due date (e.g. Dec 25)"
                value={newTaskDue}
                onChangeText={setNewTaskDue}
              />
              <Text style={styles.colorLabel}>Subject (optional):</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectScroll}>
                <TouchableOpacity
                  style={[styles.subjectPill, !newTaskSubject && styles.subjectPillActive]}
                  onPress={() => setNewTaskSubject(null)}>
                  <Text style={styles.subjectPillText}>None</Text>
                </TouchableOpacity>
                {subjects.map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[styles.subjectPill, { borderColor: s.color },
                      newTaskSubject?.id === s.id && { backgroundColor: s.color }]}
                    onPress={() => setNewTaskSubject(s)}>
                    <Text style={[styles.subjectPillText,
                      newTaskSubject?.id === s.id && { color: '#fff' }]}>
                      {s.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setTaskModal(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.addBtn} onPress={addTask}>
                  <Text style={styles.addText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#1a1a2e', marginTop: 20, marginBottom: 20 },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 4, marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  activeTab: { backgroundColor: '#1a1a2e' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#888' },
  activeTabText: { color: '#fff' },
  content: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#888' },
  emptySubText: { fontSize: 14, color: '#aaa', marginTop: 8 },
  subjectCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderLeftWidth: 5, flexDirection: 'row', alignItems: 'center', gap: 12 },
  subjectDot: { width: 12, height: 12, borderRadius: 6 },
  subjectName: { flex: 1, fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  subjectTaskCount: { fontSize: 12, color: '#aaa', marginRight: 8 },
  deleteBtn: { fontSize: 16, color: '#ddd' },
  filters: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff' },
  activeFilterPill: { backgroundColor: '#1a1a2e' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#888' },
  activeFilterText: { color: '#fff' },
  taskCard: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: { width: 28 },
  checkboxText: { fontSize: 20 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#1a1a2e', marginBottom: 6 },
  taskDone: { textDecorationLine: 'line-through', color: '#aaa' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subjectTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  subjectTagText: { fontSize: 11, fontWeight: '600' },
  dueDate: { fontSize: 11, color: '#aaa' },
  fab: { position: 'absolute', bottom: 20, right: 0, backgroundColor: '#1a1a2e', width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  fabText: { color: '#fff', fontSize: 30, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 30 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 20 },
  input: { backgroundColor: '#f5f5f5', borderRadius: 12, padding: 16, fontSize: 16, marginBottom: 16 },
  colorLabel: { fontSize: 14, color: '#888', marginBottom: 12 },
  colorRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: '#1a1a2e' },
  subjectScroll: { marginBottom: 24 },
  subjectPill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: '#ddd', marginRight: 8 },
  subjectPillActive: { backgroundColor: '#1a1a2e', borderColor: '#1a1a2e' },
  subjectPillText: { fontSize: 13, fontWeight: '600', color: '#1a1a2e' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 12, borderWidth: 2, borderColor: '#1a1a2e', alignItems: 'center' },
  cancelText: { fontSize: 16, fontWeight: '600', color: '#1a1a2e' },
  addBtn: { flex: 1, padding: 16, borderRadius: 12, backgroundColor: '#1a1a2e', alignItems: 'center' },
  addText: { fontSize: 16, fontWeight: '600', color: '#fff' },
});