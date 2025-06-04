import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  ScrollView as ModalScrollView, // Alias for modal's ScrollView
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// Define your theme colors
const stensylColors = {
  background: '#101a23',
  textWhite: '#ffffff',
  iconWhite: '#ffffff', // For icons within this page if not from shared header
  primaryAccent: '#0b80ee',
  cardBackground: '#1a2633',
  inputBackground: '#223649',
  textMuted: '#90aecb',
  successGreen: '#48BB78',
  errorRed: '#E53E3E',
  disabledButton: '#4A5568',
  toggleActive: '#0b80ee',
  toggleInactive: '#394B59',
  modalOptionSelected: 'rgba(11, 128, 238, 0.2)', 
};

// Helper function to format time (always HH:MM:SS if hours > 0 for stopwatch)
const formatStopwatchTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const hh = String(hours).padStart(2, '0');
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  if (hours > 0) return `${hh}:${mm}:${ss}`;
  return `00:${mm}:${ss}`;
};

// Helper function to format Pomodoro time (MM:SS)
const formatPomodoroTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const mm = String(minutes).padStart(2, '0');
  const ss = String(seconds).padStart(2, '0');
  return `${mm}:${ss}`;
};

const POMODORO_BREAK_DURATION = 5 * 60;
const DEFAULT_POMODORO_STUDY_DURATION = 25 * 60;

type TimerMode = 'Stopwatch' | 'Pomodoro';
type PomodoroPhase = 'Study' | 'Break';

const pomodoroDurationOptions = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

interface StudyLogEntry {
  id: string;
  date: string; 
  startTime: string; 
  duration: string; 
  subject: string;
  topic: string; 
  notes?: string; 
  mode?: TimerMode;
  efficiency?: number;
}

const ASYNC_STORAGE_STUDY_LOG_KEY = '@StudyLogSessions_StensylApp';


const StudyTrackerScreen = () => {
  const router = useRouter(); 
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [stopwatchSeconds, setStopwatchSeconds] = useState(0);
  
  const [timerMode, setTimerMode] = useState<TimerMode>('Stopwatch');
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>('Study');
  const [customStudyDuration, setCustomStudyDuration] = useState(DEFAULT_POMODORO_STUDY_DURATION);
  const [pomodoroSecondsLeft, setPomodoroSecondsLeft] = useState(customStudyDuration);
  const [isDurationPickerVisible, setIsDurationPickerVisible] = useState(false);

  const [isEndSessionModalVisible, setIsEndSessionModalVisible] = useState(false);
  const [sessionName, setSessionName] = useState(''); 
  const [subjectStudied, setSubjectStudied] = useState('');
  const [efficiencyScore, setEfficiencyScore] = useState(''); 
  const [sessionDescription, setSessionDescription] = useState('');

  const intervalRef = useRef<NodeJS.Timeout | null>(null); 

  const resetPomodoro = useCallback((startPhase: PomodoroPhase = 'Study') => {
    setIsTimerActive(false); 
    setPomodoroPhase(startPhase);
    setPomodoroSecondsLeft(startPhase === 'Study' ? customStudyDuration : POMODORO_BREAK_DURATION);
  }, [customStudyDuration]); 

  useEffect(() => {
    if (isTimerActive) {
      intervalRef.current = setInterval(() => {
        setStopwatchSeconds((prev) => prev + 1);
        if (timerMode === 'Pomodoro') {
          setPomodoroSecondsLeft((prevSeconds) => {
            if (prevSeconds <= 1) {
              if (pomodoroPhase === 'Study') {
                setPomodoroPhase('Break'); return POMODORO_BREAK_DURATION;
              } else {
                setPomodoroPhase('Study'); return customStudyDuration; 
              }
            }
            return prevSeconds - 1;
          });
        }
      }, 1000);
    } else if (!isTimerActive && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isTimerActive, timerMode, pomodoroPhase, customStudyDuration]); 

  const toggleTimer = () => {
    setIsTimerActive(!isTimerActive);
    if (!isTimerActive && timerMode === 'Pomodoro') {
        if (pomodoroSecondsLeft === 0) { 
             const nextPhase = pomodoroPhase === 'Study' ? 'Break' : 'Study';
             setPomodoroPhase(nextPhase);
             setPomodoroSecondsLeft(nextPhase === 'Study' ? customStudyDuration : POMODORO_BREAK_DURATION);
        }
    }
  };
  
  const handleEndSessionPress = () => {
    if (isTimerActive) setIsTimerActive(false);
    if (stopwatchSeconds === 0) {
        Alert.alert("No Time Tracked", "Please start a study session before ending it.");
        return;
    }
    setIsEndSessionModalVisible(true);
  };

  const handleSaveSession = async () => {
    if (!sessionName.trim() || !subjectStudied.trim()) {
      Alert.alert("Missing Information", "Please enter both session name and subject.");
      return;
    }
    const score = parseInt(efficiencyScore, 10);
    if (efficiencyScore.trim() && (isNaN(score) || score < 1 || score > 10)) {
        Alert.alert("Invalid Score", "Efficiency score must be a number between 1 and 10.");
        return;
    }

    const now = new Date();
    const newEntry: StudyLogEntry = {
      id: Date.now().toString(), 
      date: now.toISOString().split('T')[0], 
      startTime: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      duration: formatStopwatchTime(stopwatchSeconds),
      subject: subjectStudied.trim(),
      topic: sessionName.trim(),
      notes: sessionDescription.trim() || undefined,
      mode: timerMode,
      efficiency: efficiencyScore.trim() ? score : undefined,
    };

    try {
      const existingSessionsJson = await AsyncStorage.getItem(ASYNC_STORAGE_STUDY_LOG_KEY);
      const existingSessions: StudyLogEntry[] = existingSessionsJson ? JSON.parse(existingSessionsJson) : [];
      const updatedSessions = [newEntry, ...existingSessions]; 
      await AsyncStorage.setItem(ASYNC_STORAGE_STUDY_LOG_KEY, JSON.stringify(updatedSessions));
      
      Alert.alert("Session Saved!", `"${newEntry.topic}" for ${newEntry.subject} (${newEntry.duration}) logged.`);
      
      setStopwatchSeconds(0); resetPomodoro('Study'); 
      setSessionName(''); setSubjectStudied('');
      setEfficiencyScore(''); setSessionDescription('');
      setIsEndSessionModalVisible(false);

    } catch (e) {
      console.error("Failed to save session to AsyncStorage", e);
      Alert.alert("Save Error", "Could not save your study session. Please try again.");
    }
  };

  const handleCancelSave = () => setIsEndSessionModalVisible(false);

  const toggleMode = () => {
    setIsTimerActive(false); 
    if (timerMode === 'Stopwatch') {
      setTimerMode('Pomodoro'); resetPomodoro('Study'); 
    } else {
      setTimerMode('Stopwatch');
    }
  };

  const handleDurationSelect = (durationMinutes: number) => {
    const newDurationSeconds = durationMinutes * 60;
    setCustomStudyDuration(newDurationSeconds);
    if (pomodoroPhase === 'Study') setPomodoroSecondsLeft(newDurationSeconds);
    setIsTimerActive(false); 
    setIsDurationPickerVisible(false);
  };
  
  const handleAdvancedStatsPress = () => {
    console.log("Advanced Statistics button pressed!");
    // router.push('/advancedstats' as Href); 
  };

  return (
    <View style={styles.screenContainer}> 
      <Stack.Screen 
        options={{ 
          title: 'Study Tracker', 
          // Header styling is primarily controlled by app/(tabs)/_layout.tsx
        }} 
      />

      {timerMode === 'Pomodoro' && (
        <View style={styles.topRightStopwatchContainer}>
          <Text style={styles.topRightStopwatchText}>{formatStopwatchTime(stopwatchSeconds)}</Text>
        </View>
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          <View style={styles.modeToggleContainer}>
            <Text style={[styles.modeLabel, timerMode === 'Stopwatch' && styles.modeLabelActive]}>Stopwatch</Text>
            <Switch
              trackColor={{ false: stensylColors.toggleInactive, true: stensylColors.toggleActive }}
              thumbColor={stensylColors.textWhite}
              ios_backgroundColor={stensylColors.toggleInactive}
              onValueChange={toggleMode}
              value={timerMode === 'Pomodoro'}
            />
            <Text style={[styles.modeLabel, timerMode === 'Pomodoro' && styles.modeLabelActive]}>Pomodoro</Text>
          </View>

          {timerMode === 'Pomodoro' && (
            <TouchableOpacity onPress={() => setIsDurationPickerVisible(true)} style={styles.durationDisplayTouchable}>
              <Text style={styles.durationDisplayText}>
                {`${customStudyDuration / 60} min Study / ${POMODORO_BREAK_DURATION / 60} min Break`}
              </Text>
              <MaterialIcons name="edit" size={16} color={stensylColors.textMuted} style={{marginLeft: 5}}/>
            </TouchableOpacity>
          )}

          {timerMode === 'Stopwatch' && (
            <View style={styles.timerDisplayContainer}>
              <Text style={styles.timerText}>{formatStopwatchTime(stopwatchSeconds)}</Text>
            </View>
          )}

          {timerMode === 'Pomodoro' && (
            <View style={styles.timerDisplayContainer}>
              <Text style={styles.pomodoroPhaseText}>{pomodoroPhase === 'Study' ? 'Study Time' : 'Break Time!'}</Text>
              <Text style={styles.timerText}>{formatPomodoroTime(pomodoroSecondsLeft)}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.playPauseButton} onPress={toggleTimer}>
            <MaterialIcons 
              name={isTimerActive ? "pause-circle-filled" : "play-circle-filled"} 
              size={80} 
              color={stensylColors.primaryAccent} 
            />
          </TouchableOpacity>
        </ScrollView>
        
        <View style={styles.endSessionButtonContainer}>
            <TouchableOpacity 
                style={[styles.actionButton, styles.endButton]} 
                onPress={handleEndSessionPress}
            >
                <Text style={styles.actionButtonText}>End Session</Text>
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* End Session Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEndSessionModalVisible}
        onRequestClose={handleCancelSave}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOuterKAV} 
        >
          <View style={styles.modalOverlay}> 
            <View style={styles.modalContent}> 
              <Text style={styles.modalTitle}>Save Study Session</Text>
              <Text style={styles.modalDurationText}>Total Duration: {formatStopwatchTime(stopwatchSeconds)}</Text>
              <ModalScrollView style={styles.modalInputsScrollView} contentContainerStyle={styles.modalInputsScrollContent}>
                <TextInput
                  style={styles.modalInput}
                  placeholder="Name of the session (e.g., Midterm Prep Ch. 3)"
                  placeholderTextColor={stensylColors.textMuted}
                  value={sessionName}
                  onChangeText={setSessionName}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Subject studied (e.g., Calculus II)"
                  placeholderTextColor={stensylColors.textMuted}
                  value={subjectStudied}
                  onChangeText={setSubjectStudied}
                />
                <TextInput
                  style={styles.modalInput}
                  placeholder="Efficiency Score (1-10, Optional)"
                  placeholderTextColor={stensylColors.textMuted}
                  value={efficiencyScore}
                  onChangeText={setEfficiencyScore}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                <TextInput
                  style={[styles.modalInput, styles.modalDescriptionInput]}
                  placeholder="Optional: What did you work on?"
                  placeholderTextColor={stensylColors.textMuted}
                  value={sessionDescription}
                  onChangeText={setSessionDescription}
                  multiline={true}
                  numberOfLines={3}
                />
              </ModalScrollView>
              <View style={styles.modalButtonRow}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={handleCancelSave}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveSession}>
                  <Text style={styles.modalButtonText}>Save Session</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Pomodoro Duration Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDurationPickerVisible}
        onRequestClose={() => setIsDurationPickerVisible(false)}
      >
        <TouchableOpacity style={styles.modalPickerOverlay} activeOpacity={1} onPressOut={() => setIsDurationPickerVisible(false)}>
          <View style={styles.durationPickerModalContent}>
            <Text style={styles.modalTitle}>Select Study Duration</Text>
            <ModalScrollView>
              {pomodoroDurationOptions.map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.durationOptionButton,
                    customStudyDuration === minutes * 60 && styles.durationOptionSelected,
                  ]}
                  onPress={() => handleDurationSelect(minutes)}
                >
                  <Text style={styles.durationOptionText}>{minutes} minutes</Text>
                </TouchableOpacity>
              ))}
            </ModalScrollView>
            <TouchableOpacity 
              style={[styles.modalButton, styles.cancelButton, {marginTop: 10, width: '100%'}]} 
              onPress={() => setIsDurationPickerVisible(false)}
            >
              <Text style={styles.modalButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const pageHorizontalPadding = 16;
// const graphBoxInset = 10; // Not used in this file
// const graphBoxInternalPadding = 8; // Not used in this file


const styles = StyleSheet.create({
  screenContainer: { 
    flex: 1,
    backgroundColor: stensylColors.background, 
  },
  topRightStopwatchContainer: { 
    position: 'absolute', 
    top: Platform.OS === 'ios' ? 10 : 10, 
    right: pageHorizontalPadding, 
    backgroundColor: stensylColors.cardBackground,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, zIndex: 10,
  },
  topRightStopwatchText: {
    color: stensylColors.textWhite, fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'],
  },
  keyboardAvoidingContainer: { flex: 1 },
  scrollContentContainer: {
    flexGrow: 1, justifyContent: 'center', alignItems: 'center',
    padding: pageHorizontalPadding, 
    paddingTop: 20, 
    paddingBottom: 20, 
  },
  modeToggleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 }, 
  modeLabel: { fontSize: 16, color: stensylColors.textMuted, marginHorizontal: 10 },
  modeLabelActive: { color: stensylColors.primaryAccent, fontWeight: 'bold' },
  
  durationDisplayTouchable: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: stensylColors.inputBackground, 
    borderRadius: 8,
    marginBottom: 20, 
  },
  durationDisplayText: {
    color: stensylColors.textMuted,
    fontSize: 14,
    fontWeight: '500',
  },

  timerDisplayContainer: {
    marginBottom: 30, 
    paddingHorizontal: 20, paddingVertical: 15,
    backgroundColor: stensylColors.cardBackground, borderRadius: 20,
    minWidth: '85%', alignItems: 'center',
  },
  timerText: {
    fontSize: 64, fontWeight: 'bold', color: stensylColors.textWhite,
    fontVariant: ['tabular-nums'], 
  },
  pomodoroPhaseText: {
    fontSize: 18, color: stensylColors.textMuted,
    marginBottom: 8, fontWeight: '600',
  },
  playPauseButton: { marginBottom: 40 }, 
  endSessionButtonContainer: {
    paddingHorizontal: pageHorizontalPadding, 
    paddingBottom: Platform.OS === 'ios' ? 30 : 20, 
    paddingTop: 10, 
    backgroundColor: stensylColors.background, 
  },
  actionButton: { paddingVertical: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  endButton: { backgroundColor: stensylColors.primaryAccent },
  actionButtonText: { color: stensylColors.textWhite, fontSize: 18, fontWeight: '600' },
  
  modalOuterKAV: { 
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center', 
  },
  modalOverlay: { 
    flex: 1, 
    width: '100%', 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    width: '90%', 
    maxHeight: Platform.OS === 'ios' ? '85%' : '90%', 
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 15, 
    alignItems: 'center', 
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: stensylColors.textWhite, marginBottom: 10, marginTop: 20, textAlign: 'center' },
  modalDurationText: { fontSize: 16, color: stensylColors.textMuted, marginBottom: 15, textAlign: 'center' },
  modalInputsScrollView: { 
    width: '100%',
    maxHeight: Platform.OS === 'ios' ? 250 : 200, 
  },
  modalInputsScrollContent: { 
     paddingHorizontal: 20, 
  },
  modalInput: {
    width: '100%', backgroundColor: stensylColors.inputBackground,
    borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12,
    fontSize: 16, color: stensylColors.textWhite, marginBottom: 12, 
    borderWidth: 1, borderColor: stensylColors.background, 
  },
  modalDescriptionInput: { 
    minHeight: 80, 
    textAlignVertical: 'top', 
  },
  modalButtonRow: { 
    flexDirection: 'row', justifyContent: 'space-between', 
    width: '100%', marginTop: 15, paddingHorizontal: 20, paddingBottom: 20,
  },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  saveButton: { backgroundColor: stensylColors.successGreen },
  cancelButton: { backgroundColor: stensylColors.disabledButton },
  modalButtonText: { color: stensylColors.textWhite, fontSize: 16, fontWeight: '600' },

  modalPickerOverlay: { 
    flex: 1, justifyContent: 'center', alignItems: 'center', 
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  durationPickerModalContent: {
    width: '80%', maxHeight: '70%', 
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 15, padding: 20, alignItems: 'stretch', 
  },
  durationOptionButton: {
    paddingVertical: 15, borderBottomWidth: 1,
    borderBottomColor: stensylColors.inputBackground, 
    alignItems: 'center',
  },
  durationOptionSelected: {
    backgroundColor: stensylColors.modalOptionSelected, 
  },
  durationOptionText: {
    color: stensylColors.textWhite,
    fontSize: 18,
  },
});

export default StudyTrackerScreen;

