// app/(tabs)/study.tsx
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  AppState,
  Button,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { SESSIONS_STORAGE_KEY } from '../../constants/storage';
import { SessionData } from '../../types';
import { formatTime } from '../../utils/formatters';

const POMODORO_WORK_DURATION = 25 * 60;
const POMODORO_SHORT_BREAK_DURATION = 5 * 60;
const POMODORO_LONG_BREAK_DURATION = 15 * 60;
const CYCLES_BEFORE_LONG_BREAK = 4;

type PomodoroState = 'IDLE' | 'WORK' | 'SHORT_BREAK' | 'LONG_BREAK';
type SessionMode = 'REGULAR' | 'POMODORO';

export default function StudySessionScreen() {
  const [subject, setSubject] = useState('');
  const [time, setTime] = useState(0); // For REGULAR mode: elapsed time
  const [isRunning, setIsRunning] = useState(false);

  const [isLogModalVisible, setLogModalVisible] = useState(false);
  const [sessionToLog, setSessionToLog] = useState<Omit<SessionData, 'id' | 'notes' | 'rating' | 'completedAt'> | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [sessionRating, setSessionRating] = useState('');

  const [sessionMode, setSessionMode] = useState<SessionMode>('REGULAR');
  const [pomodoroState, setPomodoroState] = useState<PomodoroState>('IDLE');
  const [timeRemaining, setTimeRemaining] = useState(POMODORO_WORK_DURATION);
  const [currentCycles, setCurrentCycles] = useState(0); // Completed work cycles

  const timeRef = useRef(time);
  const isRunningRef = useRef(isRunning);
  const appState = useRef(AppState.currentState);
  const backgroundEntryTimeRef = useRef<number | null>(null);
  const timeRemainingRef = useRef(timeRemaining);
  const pomodoroStateRef = useRef(pomodoroState);
  const sessionModeRef = useRef(sessionMode); // Ref for sessionMode

  useEffect(() => { timeRef.current = time; }, [time]);
  useEffect(() => { timeRemainingRef.current = timeRemaining; }, [timeRemaining]);
  useEffect(() => { pomodoroStateRef.current = pomodoroState; }, [pomodoroState]);
  useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
  useEffect(() => { sessionModeRef.current = sessionMode; }, [sessionMode]); // Update sessionMode ref


  const handlePomodoroIntervalEnd = () => {
    setIsRunning(false); // Stop timer, user explicitly starts next phase

    let nextState: PomodoroState = 'IDLE';
    let nextTimeRemaining = 0;
    let newCycles = currentCycles;
    let alertTitle = "Interval Complete!";
    let alertMessage = "";

    if (pomodoroStateRef.current === 'WORK') {
      newCycles++;
      setCurrentCycles(newCycles);
      if (newCycles % CYCLES_BEFORE_LONG_BREAK === 0) {
        nextState = 'LONG_BREAK';
        nextTimeRemaining = POMODORO_LONG_BREAK_DURATION;
        alertMessage = `Time for a long break (${POMODORO_LONG_BREAK_DURATION / 60} minutes)!`;
      } else {
        nextState = 'SHORT_BREAK';
        nextTimeRemaining = POMODORO_SHORT_BREAK_DURATION;
        alertMessage = `Time for a short break (${POMODORO_SHORT_BREAK_DURATION / 60} minutes)!`;
      }
    } else if (pomodoroStateRef.current === 'SHORT_BREAK' || pomodoroStateRef.current === 'LONG_BREAK') {
      nextState = 'WORK';
      nextTimeRemaining = POMODORO_WORK_DURATION;
      alertMessage = `Break's over! Time for a new work session (${POMODORO_WORK_DURATION / 60} minutes).`;
    }

    setPomodoroState(nextState);
    setTimeRemaining(nextTimeRemaining);
    Alert.alert(alertTitle, alertMessage);
  };

  useEffect(() => {
    let interval: number | undefined = undefined;

    if (isRunning) {
      if (sessionModeRef.current === 'REGULAR') {
        interval = setInterval(() => {
          setTime(prevTime => prevTime + 1);
        }, 1000);
      } else if (sessionModeRef.current === 'POMODORO') {
        if (pomodoroStateRef.current !== 'IDLE') { // Ensure a Pomodoro state is active
          interval = setInterval(() => {
            setTimeRemaining(prevTimeRemaining => {
              if (prevTimeRemaining <= 1) {
                clearInterval(interval);
                handlePomodoroIntervalEnd();
                return 0;
              }
              return prevTimeRemaining - 1;
            });
          }, 1000);
        } else {
           setIsRunning(false); // Should not be running if Pomodoro is IDLE
        }
      }
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isRunning]); // Removed sessionMode from here, using ref instead to prevent re-triggering interval unnecessarily


  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      const currentAppState = appState.current;
      appState.current = nextAppState;

      if (currentAppState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
        if (backgroundEntryTimeRef.current && isRunningRef.current) {
          const timeInBackground = Math.floor((Date.now() - backgroundEntryTimeRef.current) / 1000);
          
          if (sessionModeRef.current === 'REGULAR') {
            setTime(prevTime => prevTime + timeInBackground);
          } else if (sessionModeRef.current === 'POMODORO' && pomodoroStateRef.current !== 'IDLE') {
            const newTimeRemaining = timeRemainingRef.current - timeInBackground;
            if (newTimeRemaining <= 0) {
              // To prevent issues if handlePomodoroIntervalEnd sets state, we set timeRemaining first
              // then call the handler which might alter it again based on the new state.
              // Or, more safely, let the next interval tick in useEffect handle it.
              // For now, just set it and the useEffect for timer will catch it.
              setTimeRemaining(0); 
              // It's tricky to call handlePomodoroIntervalEnd directly here due to state updates
              // The main timer useEffect will catch timeRemaining <= 0 on the next tick
            } else {
              setTimeRemaining(newTimeRemaining);
            }
          }
          backgroundEntryTimeRef.current = null;
        }
      } else if (nextAppState.match(/inactive|background/)) {
        console.log('App has gone to the background!');
        if (isRunningRef.current) {
          backgroundEntryTimeRef.current = Date.now();
        }
      }
    });
    return () => {
      subscription.remove();
    };
  }, []); // No dependencies, runs once

  const handleStartPause = () => {
    if (isRunning) { // Pausing
      setIsRunning(false);
      // backgroundEntryTimeRef.current is already set by AppState or if not, it means manual pause.
    } else { // Starting or Resuming
      if (sessionMode === 'REGULAR') {
        // Regular mode start/resume (backgroundEntryTimeRef handling already in AppState effect)
      } else if (sessionMode === 'POMODORO') {
        if (pomodoroState === 'IDLE') { // Starting a new Pomodoro session
          setPomodoroState('WORK');
          setTimeRemaining(POMODORO_WORK_DURATION);
          setCurrentCycles(0); // Reset cycles for a new Pomodoro session
        }
        // For WORK, SHORT_BREAK, LONG_BREAK, just resume the countdown.
        // timeRemaining is already set to the correct value for the next state by handlePomodoroIntervalEnd
      }
      setIsRunning(true);
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
    setSubject('');
    // setSessionMode('REGULAR'); // Optional: Reset mode preference
    setPomodoroState('IDLE');
    setTimeRemaining(POMODORO_WORK_DURATION);
    setCurrentCycles(0);
    backgroundEntryTimeRef.current = null;
    Alert.alert("Timer Reset", "Your session timer and Pomodoro state have been reset.");
  };

  const handleEndSession = () => {
    setIsRunning(false);
    let durationToLog = 0;
    let notesSuffix = "";

    if (sessionMode === 'REGULAR') {
      durationToLog = time;
    } else if (sessionMode === 'POMODORO') {
      // Log total work time. If current state is WORK, add elapsed part of it.
      // For simplicity now, just log completed cycles.
      durationToLog = currentCycles * POMODORO_WORK_DURATION;
      notesSuffix = `\nCompleted Pomodoro Cycles: ${currentCycles}`;
       // Reset Pomodoro state fully upon ending, preparing for a completely new one next time.
      setPomodoroState('IDLE');
      setTimeRemaining(POMODORO_WORK_DURATION);
      setCurrentCycles(0);
    }
    
    setSessionToLog({
      subject: subject || 'Not specified',
      duration: durationToLog,
    });
    setSessionNotes(prevNotes => prevNotes + notesSuffix); // Append Pomodoro info to notes
    setSessionRating('');
    setLogModalVisible(true);
  };

  const handleSaveSessionLog = async () => {
    console.log("--- handleSaveSessionLog called (Expo Go) ---");
    if (sessionToLog) {
      const ratingValue = parseInt(sessionRating, 10);
      const newSessionData: SessionData = {
        id: Date.now().toString(),
        subject: sessionToLog.subject,
        duration: sessionToLog.duration,
        notes: sessionNotes,
        rating: isNaN(ratingValue) ? undefined : ratingValue,
        completedAt: new Date().toISOString(),
      };

      try {
        const existingSessionsJson = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
        let existingSessions: SessionData[] = [];
        if (existingSessionsJson !== null) {
          existingSessions = JSON.parse(existingSessionsJson);
        }
        existingSessions.push(newSessionData);
        await AsyncStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(existingSessions));
        Alert.alert(
          "Session Saved!",
          `Subject: ${newSessionData.subject}\nDuration: ${formatTime(newSessionData.duration)}`,
          [{ text: "OK" }]
        );
      } catch (e) {
        console.error("--- ERROR in handleSaveSessionLog (Expo Go) ---", e);
        Alert.alert("Error Saving Session", "Could not save session.");
      }
      setLogModalVisible(false);
      setTime(0); // Reset regular timer
      setSubject('');
      setSessionNotes(''); // Clear notes for next session
      // Pomodoro specific states were reset in handleEndSession or handleReset is called next
      // Let's ensure a full reset here by calling handleReset.
      handleReset();
    }
  };

  const handleCloseLogModal = () => {
    setLogModalVisible(false);
     // It might be good to call handleReset() here too if the user closes without saving
     // to ensure a clean state, or at least reset subject/notes.
     // For now, just closing. Consider if timer should be reset.
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headerText}>Start Your Focus Session</Text>

        <TextInput
          style={styles.input}
          placeholder="What are you studying?"
          value={subject}
          onChangeText={setSubject}
          editable={!isRunning && time === 0 && (sessionMode === 'REGULAR' || pomodoroState === 'IDLE')}
        />

        <View style={styles.modeSelectorContainer}>
          <Text style={styles.modeLabel}>Regular Timer</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={sessionMode === 'POMODORO' ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => {
              setIsRunning(false); 
              setTime(0);
              setPomodoroState('IDLE');
              setCurrentCycles(0);
              const newMode = sessionMode === 'REGULAR' ? 'POMODORO' : 'REGULAR';
              setSessionMode(newMode);
              setTimeRemaining(newMode === 'POMODORO' ? POMODORO_WORK_DURATION : 0); // Reset appropriately
            }}
            value={sessionMode === 'POMODORO'}
            disabled={isRunning && (time > 0 || (sessionMode === 'POMODORO' && pomodoroState !== 'IDLE'))}
          />
          <Text style={styles.modeLabel}>Pomodoro Mode</Text>
        </View>

        <Text style={styles.timerText}>
          {sessionMode === 'REGULAR'
            ? formatTime(time)
            : formatTime(timeRemaining)}
        </Text>

        {sessionMode === 'POMODORO' && pomodoroState !== 'IDLE' && (
          <View style={styles.pomodoroStatusContainer}>
            <Text style={styles.pomodoroStatusText}>
              {pomodoroState.replace('_', ' ')}
            </Text>
            {(pomodoroState === 'WORK') && ( // Only show cycle count during WORK
              <Text style={styles.pomodoroStatusText}>
                Cycle: {currentCycles + 1} / {CYCLES_BEFORE_LONG_BREAK}
              </Text>
            )}
          </View>
        )}

        <View style={styles.buttonContainer}>
          <Button
            title={isRunning ? "Pause" : "Start"}
            onPress={handleStartPause}
            color={isRunning ? "#FFC107" : (pomodoroState !== 'IDLE' ? "#4CAF50" : "#4CAF50") } // Keep start green
            // disabled={sessionMode === 'POMODORO' && pomodoroState !== 'IDLE' && timeRemaining === 0 && !isRunning }
          />
          <Button
            title="Reset"
            onPress={handleReset}
            disabled={!isRunning && time === 0 && (sessionMode === 'REGULAR' || pomodoroState === 'IDLE')}
            color="#757575"
          />
        </View>
        <View style={styles.endButtonContainer}>
          <Button
            title="End Session"
            onPress={handleEndSession}
            disabled={time === 0 && (sessionMode === 'REGULAR' || (pomodoroState === 'IDLE' && currentCycles === 0))}
            color="#F44336"
          />
        </View>
      </View>

      {/* Modal remains the same */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isLogModalVisible}
        onRequestClose={handleCloseLogModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Log Your Session</Text>
              {sessionToLog && (
                <>
                  <Text style={styles.modalText}>Subject: {sessionToLog.subject}</Text>
                  <Text style={styles.modalText}>Duration: {formatTime(sessionToLog.duration)}</Text>
                </>
              )}
              <Text style={styles.modalLabel}>Session Notes:</Text>
              <TextInput
                style={[styles.input, styles.notesInput]}
                placeholder="How did it go? Any key takeaways?"
                value={sessionNotes}
                onChangeText={setSessionNotes}
                multiline={true}
                numberOfLines={4}
              />
              <Text style={styles.modalLabel}>Productivity Rating (1-5):</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 4"
                value={sessionRating}
                onChangeText={setSessionRating}
                keyboardType="numeric"
                maxLength={1}
              />
              <View style={styles.modalButtonContainer}>
                <Button title="Save Log" onPress={handleSaveSessionLog} color="#4CAF50" />
                <Button title="Close" onPress={handleCloseLogModal} color="#757575" />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// Styles (assuming styles from previous step are already here and correct)
// Ensure modeSelectorContainer, modeLabel, pomodoroStatusContainer, pomodoroStatusText are present
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    width: '90%',
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  modeSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    paddingVertical: 10,
  },
  modeLabel: {
    fontSize: 16,
    marginHorizontal: 10,
    color: '#555',
  },
  pomodoroStatusContainer: {
    marginBottom: 10,
    alignItems: 'center',
  },
  pomodoroStatusText: {
    fontSize: 16,
    color: '#444',
    marginBottom: 3,
  },
  timerText: {
    fontSize: 64,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginBottom: 20,
  },
  endButtonContainer: {
    width: '80%',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'stretch',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  notesInput: { 
    height: 100,
    textAlignVertical: 'top',
    width: '100%',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
});