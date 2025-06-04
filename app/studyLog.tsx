import { MaterialIcons } from '@expo/vector-icons'; // For icons
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';

// Define your theme colors (consistent with other pages)
const stensylColors = {
  background: '#101a23',
  headerBackground: 'rgba(16, 26, 35, 0.8)',
  textWhite: '#ffffff',
  iconWhite: '#ffffff', 
  cardBackground: '#1a2633', 
  textMuted: '#90aecb',
  primaryAccent: '#0b80ee', 
};

// MODIFIED: Updated StudyLogEntry interface to include new fields
// This should match the interface used in studyTracker.tsx
type TimerMode = 'Stopwatch' | 'Pomodoro'; // Assuming TimerMode is defined like this in tracker

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

const ASYNC_STORAGE_STUDY_LOG_KEY = '@StudyLogSessions_StensylApp'; // Must match key in tracker

// Component to render a single study log item
const StudyLogItem: React.FC<{ item: StudyLogEntry }> = ({ item }) => {
  return (
    <View style={styles.logItemContainer}>
      <View style={styles.logItemHeader}>
        <Text style={styles.logItemDate}>
          {new Date(item.date + 'T' + item.startTime.replace(/\s[AP]M$/, '')).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })} at {item.startTime}
        </Text>
        <Text style={styles.logItemDuration}><MaterialIcons name="timer" size={14} color={stensylColors.primaryAccent} /> {item.duration}</Text>
      </View>
      <Text style={styles.logItemSubject}>{item.subject}: <Text style={styles.logItemTopic}>{item.topic}</Text></Text>
      {item.notes && <Text style={styles.logItemNotes}>Notes: {item.notes}</Text>}
      <View style={styles.logItemDetailsRow}>
        {item.mode && <Text style={styles.logItemMeta}>Mode: {item.mode}</Text>}
        {item.efficiency !== undefined && <Text style={styles.logItemMeta}>Efficiency: {item.efficiency}/10</Text>}
      </View>
    </View>
  );
};


const StudyLogScreen = () => {
  const [studySessions, setStudySessions] = useState<StudyLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadStudySessions = useCallback(async () => {
    console.log("Attempting to load study sessions from AsyncStorage...");
    setIsLoading(true);
    try {
      const sessionsJson = await AsyncStorage.getItem(ASYNC_STORAGE_STUDY_LOG_KEY);
      if (sessionsJson !== null) {
        const loadedSessions = JSON.parse(sessionsJson);
        console.log("Loaded sessions:", loadedSessions.length);
        setStudySessions(loadedSessions);
      } else {
        console.log("No sessions found in AsyncStorage.");
        setStudySessions([]); 
      }
    } catch (e) {
      console.error("Failed to load study sessions from AsyncStorage", e);
      setStudySessions([]); 
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load sessions when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadStudySessions();
      return () => {
        // Optional: cleanup if needed when screen loses focus
      };
    }, [loadStudySessions])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen 
        options={{ 
          title: 'Study Log', 
          headerStyle: { backgroundColor: stensylColors.headerBackground },
          headerTintColor: stensylColors.iconWhite,
          headerTitleStyle: { color: stensylColors.textWhite },
          headerBackTitleVisible: false, // Hides "Back" text on iOS
          // Optional: Add a manual refresh button to the header
          // headerRight: () => (
          //   <TouchableOpacity onPress={loadStudySessions} style={{ marginRight: 15 }}>
          //     <MaterialIcons name="refresh" size={26} color={stensylColors.iconWhite} />
          //   </TouchableOpacity>
          // ),
        }} 
      />
      
      <FlatList
        data={studySessions}
        renderItem={({ item }) => <StudyLogItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContentContainer}
        ListHeaderComponent={
          <Text style={styles.pageTitle}>My Study Log</Text>
        }
        ListEmptyComponent={
          isLoading ? (
            <View style={styles.emptyContainer}><Text style={styles.placeholderText}>Loading sessions...</Text></View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.placeholderText}>No study sessions logged yet.</Text>
              <Text style={styles.placeholderText}>Track a session to see it here!</Text>
            </View>
          )
        }
        refreshing={isLoading} 
        onRefresh={loadStudySessions} // Enable pull-to-refresh
      />
    </SafeAreaView>
  );
};

const pageHorizontalPadding = 16;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  listContentContainer: {
    paddingHorizontal: pageHorizontalPadding,
    paddingBottom: 20, 
  },
  pageTitle: {
    fontSize: 24, 
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginTop: 20, 
    marginBottom: 20,
    textAlign: 'left', 
  },
  logItemContainer: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logItemDate: {
    fontSize: 15,
    fontWeight: '600',
    color: stensylColors.textWhite,
    flexShrink: 1, 
  },
  logItemDuration: {
    fontSize: 14,
    color: stensylColors.primaryAccent,
    fontWeight: '500',
    marginLeft: 8,
  },
  logItemSubject: {
    fontSize: 17, 
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 4,
  },
  logItemTopic: {
    fontWeight: 'normal',
    fontSize: 15, 
    color: stensylColors.textMuted, 
  },
  logItemNotes: {
    fontSize: 14,
    color: stensylColors.textMuted,
    fontStyle: 'italic',
    marginTop: 6,
    marginBottom: 8,
  },
  logItemDetailsRow: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap', // Allow items to wrap if too long
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)', // More subtle separator
  },
  logItemMeta: {
    fontSize: 12,
    color: stensylColors.textMuted,
    marginRight: 10, // Add some space between meta items if they wrap
    marginBottom: 4, // Space if they wrap to new line
  },
  emptyContainer: {
    flex: 1, // Ensure it can take space if list is empty
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50, 
    paddingBottom: 50,
  },
  placeholderText: {
    fontSize: 16,
    color: stensylColors.textMuted, 
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default StudyLogScreen;

