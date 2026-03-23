import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useState, useEffect, useRef } from 'react';

export default function TimerScreen() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(prev => {
          if (prev === 0) {
            setMinutes(m => {
              if (m === 0) {
                setIsRunning(false);
                setIsBreak(b => !b);
                const next = !isBreak;
                setMinutes(next ? 5 : 25);
                setSeconds(0);
                return next ? 5 : 25;
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

  const reset = () => {
    setIsRunning(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pomodoro Timer</Text>
      <Text style={styles.mode}>{isBreak ? '☕ Break Time' : '📚 Study Time'}</Text>

      <View style={styles.timerCircle}>
        <Text style={styles.timerText}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  mode: { fontSize: 16, color: '#888', marginBottom: 50 },
  timerCircle: { width: 220, height: 220, borderRadius: 110, backgroundColor: '#1a1a2e', justifyContent: 'center', alignItems: 'center', marginBottom: 50 },
  timerText: { fontSize: 52, fontWeight: 'bold', color: '#fff' },
  buttons: { flexDirection: 'row', gap: 16 },
  startBtn: { backgroundColor: '#1a1a2e', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30 },
  pauseBtn: { backgroundColor: '#e74c3c' },
  startText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  resetBtn: { backgroundColor: '#fff', paddingHorizontal: 40, paddingVertical: 16, borderRadius: 30, borderWidth: 2, borderColor: '#1a1a2e' },
  resetText: { color: '#1a1a2e', fontSize: 18, fontWeight: '600' },
});