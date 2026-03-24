import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { saveData, loadData } from '../storage/storage';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';

export default function TimerScreen() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [focusTime, setFocusTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);
  const intervalRef = useRef(null);

  useEffect(() => {
    loadData('subjects').then(data => { if (data) setSubjects(data); });
    loadData('sessions').then(data => { if (data) setCompletedSessions(data.length); });
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev === 0) {
            setMinutes(m => {
              if (m === 0) {
                handleTimerComplete();
                return isBreak ? focusTime : breakTime;
              }
              return m - 1;
            });
            return 59;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const playSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: 'https://actions.google.com/sounds/v1/alarms/beep_short.ogg' },
        { shouldPlay: true }
      );
      await sound.playAsync();
    } catch (e) {}
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await playSound();
    if (!isBreak) {
      const sessions = await loadData('sessions') || [];
      const newSession = {
        id: Date.now().toString(),
        subject: selectedSubject?.name || 'General',
        color: selectedSubject?.color || '#1a1a2e',
        date: new Date().toISOString(),
        duration: focusTime,
      };
      const updated = [...sessions, newSession];
      await saveData('sessions', updated);
      setCompletedSessions(updated.length);
    }
    setIsBreak(b => !b);
  };

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setMinutes(focusTime);
    setSeconds(0);
  };

  const progress = ((focusTime * 60 - (minutes * 60 + seconds)) / (focusTime * 60)) * 100;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <LinearGradient
        colors={isBreak ? ['#1a2e1a', '#162e16', '#0f3420'] : ['#1a1a2e', '#16213e', '#0f3460']}
        style={styles.container}>

        <Text style={styles.title}>Pomodoro Timer</Text>

        {/* Mode Badge */}
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>{isBreak ? '☕ Break Time' : '📚 Study Time'}</Text>
        </View>

        {/* Subject Picker */}
        <TouchableOpacity style={styles.subjectPicker} onPress={() => setModalVisible(true)}>
          <View style={[styles.subjectDot, { backgroundColor: selectedSubject?.color || 'rgba(255,255,255,0.3)' }]} />
          <Text style={styles.subjectPickerText}>
            {selectedSubject ? selectedSubject.name : 'Select Subject'}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* Timer Circle */}
        <View style={styles.timerWrapper}>
          <View style={styles.timerOuter}>
            <View style={styles.timerInner}>
              <Text style={styles.timerText}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </Text>
              <Text style={styles.sessionCount}>🍅 {completedSessions} sessions</Text>
            </View>
          </View>
        </View>

        {/* Time Controls */}
        <View style={styles.timeControls}>
          <View style={styles.timeControl}>
            <Text style={styles.timeLabel}>Focus</Text>
            <View style={styles.timeRow}>
              <TouchableOpacity style={styles.timeControlBtn} onPress={() => { if (!isRunning && focusTime > 1) { setFocusTime(f => f - 1); setMinutes(focusTime - 1); setSeconds(0); }}}>
                <Text style={styles.timeBtnText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.timeInput}
                value={String(focusTime)}
                keyboardType="number-pad"
                editable={!isRunning}
                onChangeText={(val) => {
                  const num = parseInt(val);
                  if (!isNaN(num) && num > 0 && num <= 180) {
                    setFocusTime(num);
                    setMinutes(num);
                    setSeconds(0);
                  }
                }}
              />
              <Text style={styles.timeUnit}>min</Text>
              <TouchableOpacity style={styles.timeControlBtn} onPress={() => { if (!isRunning && focusTime < 180) { setFocusTime(f => f + 1); setMinutes(focusTime + 1); setSeconds(0); }}}>
                <Text style={styles.timeBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeDivider} />

          <View style={styles.timeControl}>
            <Text style={styles.timeLabel}>Break</Text>
            <View style={styles.timeRow}>
              <TouchableOpacity style={styles.timeControlBtn} onPress={() => { if (!isRunning && breakTime > 1) setBreakTime(b => b - 1); }}>
                <Text style={styles.timeBtnText}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.timeInput}
                value={String(breakTime)}
                keyboardType="number-pad"
                editable={!isRunning}
                onChangeText={(val) => {
                  const num = parseInt(val);
                  if (!isNaN(num) && num > 0 && num <= 60) setBreakTime(num);
                }}
              />
              <Text style={styles.timeUnit}>min</Text>
              <TouchableOpacity style={styles.timeControlBtn} onPress={() => { if (!isRunning) setBreakTime(b => b + 1); }}>
                <Text style={styles.timeBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity style={styles.resetBtn} onPress={reset}>
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.startBtn, isRunning && styles.pauseBtn]}
            onPress={() => setIsRunning(r => !r)}>
            <Text style={styles.startText}>{isRunning ? 'Pause' : 'Start'}</Text>
          </TouchableOpacity>
        </View>

        {/* Subject Modal */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Select Subject</Text>
              <TouchableOpacity style={styles.subjectItem} onPress={() => { setSelectedSubject(null); setModalVisible(false); }}>
                <View style={[styles.subjectItemDot, { backgroundColor: '#ccc' }]} />
                <Text style={styles.subjectItemText}>General</Text>
              </TouchableOpacity>
              <FlatList
                data={subjects}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.subjectItem} onPress={() => { setSelectedSubject(item); setModalVisible(false); }}>
                    <View style={[styles.subjectItemDot, { backgroundColor: item.color }]} />
                    <Text style={styles.subjectItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      </LinearGradient>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  title: { fontSize: 22, fontWeight: '800', color: 'rgba(255,255,255,0.9)', letterSpacing: -0.5, marginBottom: 8 },
  modeBadge: { backgroundColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, marginBottom: 24 },
  modeText: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  subjectPicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 36, gap: 10, width: '85%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  subjectDot: { width: 12, height: 12, borderRadius: 6 },
  subjectPickerText: { fontSize: 15, color: 'rgba(255,255,255,0.8)', flex: 1 },
  chevron: { fontSize: 20, color: 'rgba(255,255,255,0.4)' },
  timerWrapper: { marginBottom: 36 },
  timerOuter: { width: 240, height: 240, borderRadius: 120, borderWidth: 3, borderColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  timerInner: { width: 210, height: 210, borderRadius: 105, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  timerText: { fontSize: 54, fontWeight: '800', color: '#fff', letterSpacing: -2 },
  sessionCount: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 6 },
  timeControls: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, padding: 16, paddingHorizontal: 20, marginBottom: 28, width: '85%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  timeControl: { flex: 1, alignItems: 'center' },
  timeDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.15)', marginHorizontal: 16 },
  timeLabel: { fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 8, fontWeight: '600' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  timeControlBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  timeBtnText: { fontSize: 18, color: '#fff', fontWeight: '600' },
  timeInput: { fontSize: 18, fontWeight: '700', color: '#fff', width: 36, textAlign: 'center', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.3)', paddingBottom: 2 },
  timeUnit: { fontSize: 11, color: 'rgba(255,255,255,0.4)' },
  buttons: { flexDirection: 'row', gap: 12 },
  startBtn: { backgroundColor: '#fff', paddingHorizontal: 44, paddingVertical: 16, borderRadius: 30 },
  pauseBtn: { backgroundColor: '#e74c3c' },
  startText: { color: '#1a1a2e', fontSize: 17, fontWeight: '800' },
  resetBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 28, paddingVertical: 16, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  resetText: { color: 'rgba(255,255,255,0.7)', fontSize: 17, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 30 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#1a1a2e', marginBottom: 20 },
  subjectItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  subjectItemDot: { width: 12, height: 12, borderRadius: 6 },
  subjectItemText: { fontSize: 16, color: '#1a1a2e', fontWeight: '500' },
  closeBtn: { marginTop: 20, backgroundColor: '#1a1a2e', padding: 16, borderRadius: 16, alignItems: 'center' },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});