import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList, TextInput, Animated, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { saveData, loadData } from '../storage/storage';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

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
  const progressAnim = useRef(new Animated.Value(1)).current;
  const totalSeconds = useRef(focusTime * 60);

  useEffect(() => {
    loadData('subjects').then(data => { if (data) setSubjects(data); });
    loadData('sessions').then(data => { if (data) setCompletedSessions(data.length); });
  }, []);

  useEffect(() => {
    totalSeconds.current = focusTime * 60;
    progressAnim.setValue(1);
    if(!isRunning) {
        setMinutes(focusTime);
        setSeconds(0);
    }
  }, [focusTime, isBreak]);

  useEffect(() => {
    if (isRunning) {
      const total = isBreak ? breakTime * 60 : focusTime * 60;
      const remaining = minutes * 60 + seconds;
      Animated.timing(progressAnim, {
        toValue: remaining / total,
        duration: 1000,
        useNativeDriver: false,
      }).start();
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
    } catch (e) {
      console.log('Sound error', e);
    }
  };

  const handleTimerComplete = async () => {
    setIsRunning(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await playSound();
    progressAnim.setValue(1);
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
    progressAnim.setValue(1);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.title}>Pomodoro Timer</Text>
        <Text style={styles.mode}>{isBreak ? '☕ Break Time' : '📚 Study Time'}</Text>

        <TouchableOpacity style={styles.subjectPicker} onPress={() => setModalVisible(true)}>
          <View style={[styles.subjectDot, { backgroundColor: selectedSubject?.color || '#ccc' }]} />
          <Text style={styles.subjectPickerText}>
            {selectedSubject ? selectedSubject.name : 'Select Subject'}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        <View style={styles.timerWrapper}>
          <Animated.View style={styles.progressRing}>
            <View style={[styles.timerCircle, { borderColor: isBreak ? '#2ecc71' : '#1a1a2e' }]}>
              <Text style={styles.timerText}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </Text>
              <Text style={styles.sessionCount}>🍅 {completedSessions}</Text>
            </View>
          </Animated.View>
        </View>

        <View style={styles.timeControls}>
          <View style={styles.timeControl}>
            <Text style={styles.timeLabel}>Focus</Text>
            <View style={styles.timeRow}>
              <TouchableOpacity onPress={() => { if (!isRunning && focusTime > 1) { setFocusTime(f => f - 1); setMinutes(focusTime - 1); setSeconds(0); }}}>
                <Text style={styles.timeBtn}>−</Text>
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
              <TouchableOpacity onPress={() => { if (!isRunning && focusTime < 180) { setFocusTime(f => f + 1); setMinutes(focusTime + 1); setSeconds(0); }}}>
                <Text style={styles.timeBtn}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.timeControl}>
            <Text style={styles.timeLabel}>Break</Text>
            <View style={styles.timeRow}>
              <TouchableOpacity onPress={() => { if (!isRunning && breakTime > 1) setBreakTime(b => b - 1); }}>
                <Text style={styles.timeBtn}>−</Text>
              </TouchableOpacity>
              <TextInput
                style={styles.timeInput}
                value={String(breakTime)}
                keyboardType="number-pad"
                editable={!isRunning}
                onChangeText={(val) => {
                  const num = parseInt(val);
                  if (!isNaN(num) && num > 0 && num <= 60) {
                    setBreakTime(num);
                  }
                }}
              />
              <Text style={styles.timeUnit}>min</Text>
              <TouchableOpacity onPress={() => { if (!isRunning) setBreakTime(b => b + 1); }}>
                <Text style={styles.timeBtn}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

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

        <Modal visible={modalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modal}>
              <Text style={styles.modalTitle}>Select Subject</Text>
              <TouchableOpacity style={styles.subjectItem} onPress={() => { setSelectedSubject(null); setModalVisible(false); }}>
                <View style={[styles.subjectDot, { backgroundColor: '#ccc' }]} />
                <Text style={styles.subjectItemText}>General</Text>
              </TouchableOpacity>
              <FlatList
                data={subjects}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.subjectItem} onPress={() => { setSelectedSubject(item); setModalVisible(false); }}>
                    <View style={[styles.subjectDot, { backgroundColor: item.color }]} />
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
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  mode: { fontSize: 16, color: '#888', marginBottom: 20 },
  subjectPicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 30, gap: 10, width: '80%' },
  subjectDot: { width: 14, height: 14, borderRadius: 7 },
  subjectPickerText: { fontSize: 16, color: '#1a1a2e', flex: 1 },
  chevron: { fontSize: 20, color: '#aaa' },
  timerWrapper: { marginBottom: 40 },
  progressRing: { width: 240, height: 240, borderRadius: 120, borderWidth: 8, borderColor: '#e0e0e0', justifyContent: 'center', alignItems: 'center' },
  timerCircle: { width: 210, height: 210, borderRadius: 105, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center', borderWidth: 4 },
  timerText: { fontSize: 52, fontWeight: 'bold', color: '#fff' },
  sessionCount: { fontSize: 16, color: '#aaa', marginTop: 8 },
  timeControls: { flexDirection: 'row', gap: 30, marginBottom: 30 },
  timeControl: { alignItems: 'center' },
  timeLabel: { fontSize: 13, color: '#888', marginBottom: 8 },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  timeBtn: { fontSize: 24, color: '#1a1a2e', fontWeight: 'bold', width: 30, textAlign: 'center' },
  timeInput: { fontSize: 18, fontWeight: '600', color: '#1a1a2e', width: 45, textAlign: 'center', borderBottomWidth: 2, borderBottomColor: '#1a1a2e', paddingBottom: 2 },
  timeUnit: { fontSize: 13, color: '#888' },
  buttons: { flexDirection: 'row', gap: 16 },
  startBtn: { backgroundColor: '#1a1a2e', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30 },
  pauseBtn: { backgroundColor: '#e74c3c' },
  startText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  resetBtn: { backgroundColor: '#fff', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, borderWidth: 2, borderColor: '#1a1a2e' },
  resetText: { color: '#1a1a2e', fontSize: 18, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 30 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 20 },
  subjectItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  subjectItemText: { fontSize: 16, color: '#1a1a2e' },
  closeBtn: { marginTop: 20, backgroundColor: '#1a1a2e', padding: 16, borderRadius: 12, alignItems: 'center' },
  closeBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});