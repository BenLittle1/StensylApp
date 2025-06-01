import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';

// STEP 1: Import SessionData from its new central location
import { SessionData } from '../../types';

// STEP 2: Import SESSIONS_STORAGE_KEY from its new central location
import { SESSIONS_STORAGE_KEY } from '../../constants/storage'; // Path to constants/storage.ts
import { formatTime } from '../../utils/formatters';

// The inline SessionData interface definition that was here is NOW REMOVED.
// The inline SESSIONS_STORAGE_KEY constant that was here is NOW REMOVED.

// formatTime function is still here for now, we'll move it in the next step.


export default function HistoryScreen() {
  const [sessions, setSessions] = useState<SessionData[]>([]); // Uses imported SessionData
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const loadSessions = async () => {
        setIsLoading(true);
        try {
          // Uses imported SESSIONS_STORAGE_KEY
          const sessionsJson = await AsyncStorage.getItem(SESSIONS_STORAGE_KEY);
          if (sessionsJson !== null) {
            const parsedSessions: SessionData[] = JSON.parse(sessionsJson); // Uses imported SessionData
            parsedSessions.sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
            setSessions(parsedSessions);
          } else {
            setSessions([]);
          }
        } catch (e) {
          console.error("Failed to load sessions.", e);
          Alert.alert("Error", "Failed to load sessions.");
          setSessions([]);
        } finally {
          setIsLoading(false);
        }
      };

      loadSessions();

      return () => {
        // Optional cleanup
      };
    }, [])
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </SafeAreaView>
    );
  }

  if (sessions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.emptyText}>No study sessions recorded yet.</Text>
        <Text style={styles.emptySubText}>Go to the "Study" tab to start a new session!</Text>
      </SafeAreaView>
    );
  }

  // Uses imported SessionData
  const renderSessionItem = ({ item }: { item: SessionData }) => (
    <View style={styles.sessionItem}>
      <Text style={styles.sessionSubject}>{item.subject}</Text>
      <Text style={styles.sessionDetail}>Duration: {formatTime(item.duration)}</Text>
      <Text style={styles.sessionDetail}>Completed: {new Date(item.completedAt).toLocaleDateString()} {new Date(item.completedAt).toLocaleTimeString()}</Text>
      {item.notes && <Text style={styles.sessionNotes}>Notes: {item.notes}</Text>}
      {item.rating !== undefined && <Text style={styles.sessionDetail}>Rating: {item.rating}/5</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Session History</Text>
      <FlatList
        data={sessions}
        renderItem={renderSessionItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContentContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
    alignSelf: 'flex-start',
    paddingHorizontal: 15,
  },
  listContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
    width: '100%',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#555',
    textAlign: 'center',
  },
  emptySubText: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
  },
  sessionItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sessionSubject: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sessionDetail: {
    fontSize: 14,
    color: '#333',
    marginBottom: 3,
  },
  sessionNotes: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    marginTop: 5,
  }
});