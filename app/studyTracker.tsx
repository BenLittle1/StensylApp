import { MaterialIcons } from '@expo/vector-icons';
import { Href, Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Modal,
    ScrollView as ModalScrollView,
    Platform,
    SafeAreaView,
    ScrollView, // Main ScrollView for the page content
    StatusBar,
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
  headerBackground: 'rgba(16, 26, 35, 0.8)',
  textWhite: '#ffffff',
  iconWhite: '#ffffff',
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

// Reusable Icon Button for Header
interface HeaderIconButtonProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
}
const HeaderIconButton = ({ iconName, onPress }: HeaderIconButtonProps) => (
  <TouchableOpacity style={styles.headerIconTouchable} onPress={onPress}>
    <MaterialIcons name={iconName} size={28} color={stensylColors.iconWhite} />
  </TouchableOpacity>
);

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

const POMODORO_BREAK_DURATION = 5 * 60;  // 5 minutes in seconds
const DEFAULT_POMODORO_STUDY_DURATION = 25 * 60; // Default 25 minutes

type TimerMode = 'Stopwatch' | 'Pomodoro';
type PomodoroPhase = 'Study' | 'Break';

// Pomodoro duration options in minutes
const pomodoroDurationOptions = [15, 20, 25, 30, 35, 40, 45, 50, 55, 60];

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

  const intervalRef = useRef<NodeJS.Timeout | null>(null); // CORRECTED TYPE

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
                setPomodoroPhase('Break');
                return POMODORO_BREAK_DURATION;
              } else {
                setPomodoroPhase('Study');
                return customStudyDuration; 
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

  const handleSaveSession = () => {
    if (!sessionName.trim() || !subjectStudied.trim()) {
      Alert.alert("Missing Information", "Please enter both session name and subject.");
      return;
    }
    const totalDurationLogged = formatStopwatchTime(stopwatchSeconds);
    console.log('Session Ended:', {
      name: sessionName,
      subject: subjectStudied,
      duration: totalDurationLogged,
      totalSeconds: stopwatchSeconds,
      mode: timerMode,
    });
    
    setStopwatchSeconds(0);
    resetPomodoro('Study'); 
    setSessionName('');
    setSubjectStudied('');
    setIsEndSessionModalVisible(false);
    Alert.alert("Session Saved!", `"${sessionName}" for ${subjectStudied} (${totalDurationLogged}) logged.`);
  };

  const handleCancelSave = () => setIsEndSessionModalVisible(false);

  const toggleMode = () => {
    setIsTimerActive(false); 
    if (timerMode === 'Stopwatch') {
      setTimerMode('Pomodoro');
      resetPomodoro('Study'); 
    } else {
      setTimerMode('Stopwatch');
    }
  };

  const handleDurationSelect = (durationMinutes: number) => {
    const newDurationSeconds = durationMinutes * 60;
    setCustomStudyDuration(newDurationSeconds);
    if (pomodoroPhase === 'Study') {
      setPomodoroSecondsLeft(newDurationSeconds);
    }
    setIsTimerActive(false); 
    setIsDurationPickerVisible(false);
  };
  
  // Header navigation handlers
  const handleNotificationsPress = () => router.push('/notifications' as Href);
  const handleSearchPress = () => router.push('/search' as Href);
  const handleMessagesPress = () => router.push('/messages' as Href);
  const handleStudyLogPress = () => router.push('/studyLog' as Href);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen 
        options={{ 
          title: 'Study Tracker', 
          headerStyle: { backgroundColor: stensylColors.headerBackground },
          headerTintColor: stensylColors.iconWhite,
          headerTitleStyle: { color: stensylColors.textWhite },
          headerBackTitleVisible: false,
        }} 
      />
      {/* CORRECTED: Added the actual header JSX */}
      <View style={styles.headerContainer}>
        <View style={styles.headerInnerContainer}>
          <View style={styles.headerActions}>
            <HeaderIconButton iconName="notifications-none" onPress={handleNotificationsPress} />
            <HeaderIconButton iconName="search" onPress={handleSearchPress} />
          </View>
          <Text style={styles.headerTitle}>stensyl</Text>
          <View style={styles.headerActions}>
            <HeaderIconButton iconName="chat-bubble-outline" onPress={handleMessagesPress} />
            <HeaderIconButton iconName="article" onPress={handleStudyLogPress} />
          </View>
        </View>
      </View>

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
        animationType="slide" transparent={true} visible={isEndSessionModalVisible}
        onRequestClose={() => setIsEndSessionModalVisible(!isEndSessionModalVisible)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Save Study Session</Text>
            <Text style={styles.modalDurationText}>Total Duration: {formatStopwatchTime(stopwatchSeconds)}</Text>
            <TextInput
              style={styles.modalInput} placeholder="Name of the session"
              placeholderTextColor={stensylColors.textMuted} value={sessionName} onChangeText={setSessionName}
            />
            <TextInput
              style={styles.modalInput} placeholder="Subject studied"
              placeholderTextColor={stensylColors.textMuted} value={subjectStudied} onChangeText={setSubjectStudied}
            />
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
      </Modal>

      {/* Pomodoro Duration Picker Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDurationPickerVisible}
        onRequestClose={() => setIsDurationPickerVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPressOut={() => setIsDurationPickerVisible(false)}>
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
    </SafeAreaView>
  );
};

const pageHorizontalPadding = 16;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: stensylColors.background },
  headerContainer: {}, 
  headerInnerContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: pageHorizontalPadding, paddingVertical: 10,
    backgroundColor: stensylColors.headerBackground,
  },
  headerActions: { flexDirection: 'row', gap: 4 },
  headerIconTouchable: { padding: 8, borderRadius: 999 },
  headerTitle: { color: stensylColors.textWhite, fontSize: 24, fontWeight: 'bold', letterSpacing: -0.015 * 24 },
  topRightStopwatchContainer: { 
    position: 'absolute', top: (StatusBar.currentHeight || 0) + 70, 
    right: pageHorizontalPadding, backgroundColor: stensylColors.cardBackground,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, zIndex: 10,
  },
  topRightStopwatchText: {
    color: stensylColors.textWhite, fontSize: 14, fontWeight: '600', fontVariant: ['tabular-nums'],
  },
  keyboardAvoidingContainer: { flex: 1 },
  scrollContentContainer: {
    flexGrow: 1, justifyContent: 'center', alignItems: 'center',
    padding: pageHorizontalPadding, paddingTop: 20, 
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
    paddingHorizontal: pageHorizontalPadding, paddingBottom: Platform.OS === 'ios' ? 30 : 20, 
    paddingTop: 10, borderTopWidth: 1, borderTopColor: stensylColors.cardBackground,
  },
  actionButton: { paddingVertical: 15, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  endButton: { backgroundColor: stensylColors.primaryAccent },
  actionButtonText: { color: stensylColors.textWhite, fontSize: 18, fontWeight: '600' },
  
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: {
    width: '90%', backgroundColor: stensylColors.cardBackground,
    borderRadius: 15, padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: stensylColors.textWhite, marginBottom: 10 },
  modalDurationText: { fontSize: 16, color: stensylColors.textMuted, marginBottom: 20 },
  modalInput: {
    width: '100%', backgroundColor: stensylColors.inputBackground,
    borderRadius: 8, paddingHorizontal: 15, paddingVertical: 12,
    fontSize: 16, color: stensylColors.textWhite, marginBottom: 15,
    borderWidth: 1, borderColor: stensylColors.background, 
  },
  modalButtonRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
  modalButton: { flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  saveButton: { backgroundColor: stensylColors.successGreen },
  cancelButton: { backgroundColor: stensylColors.disabledButton },
  modalButtonText: { color: stensylColors.textWhite, fontSize: 16, fontWeight: '600' },

  durationPickerModalContent: {
    width: '80%',
    maxHeight: '70%', 
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 15,
    padding: 20,
    alignItems: 'stretch', 
  },
  durationOptionButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
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


