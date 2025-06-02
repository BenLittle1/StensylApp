import { MaterialIcons } from '@expo/vector-icons'; // For icons
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
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
  iconWhite: '#ffffff', // For back button and potential header icons
  cardBackground: '#1a2633', // Background for each log entry
  textMuted: '#90aecb',
  primaryAccent: '#0b80ee', // For icons or highlights
};

// Interface for a study log entry
interface StudyLogEntry {
  id: string;
  date: string; // e.g., "2025-05-28"
  startTime: string; // e.g., "10:00 AM"
  duration: string; // e.g., "2h 30m"
  subject: string;
  topic: string; // More specific topic
  notes?: string; // Optional short notes
}

// Component to render a single study log item
const StudyLogItem: React.FC<{ item: StudyLogEntry }> = ({ item }) => {
  return (
    <View style={styles.logItemContainer}>
      <View style={styles.logItemHeader}>
        <Text style={styles.logItemDate}>{new Date(item.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</Text>
        <Text style={styles.logItemDuration}><MaterialIcons name="timer" size={14} color={stensylColors.primaryAccent} /> {item.duration}</Text>
      </View>
      <Text style={styles.logItemSubject}>{item.subject}: <Text style={styles.logItemTopic}>{item.topic}</Text></Text>
      {item.notes && <Text style={styles.logItemNotes}>Notes: {item.notes}</Text>}
      <View style={styles.logItemFooter}>
        <Text style={styles.logItemStartTime}>Started at: {item.startTime}</Text>
        {/* Add edit/delete buttons here if needed in the future */}
      </View>
    </View>
  );
};


const StudyLogScreen = () => {
  // Placeholder data for study log entries
  const [studySessions, setStudySessions] = useState<StudyLogEntry[]>([
    {
      id: '1',
      date: '2025-05-28',
      startTime: '10:00 AM',
      duration: '2h 30m',
      subject: 'React Native Development',
      topic: 'Expo Router & Navigation',
      notes: 'Worked on dynamic routing for the comments section.',
    },
    {
      id: '2',
      date: '2025-05-27',
      startTime: '2:00 PM',
      duration: '1h 45m',
      subject: 'Calculus II',
      topic: 'Integration Techniques',
      notes: 'Reviewed partial fractions and trigonometric substitution.',
    },
    {
      id: '3',
      date: '2025-05-27',
      startTime: '9:30 AM',
      duration: '0h 50m',
      subject: 'Data Structures',
      topic: 'Big O Notation Review',
    },
    {
      id: '4',
      date: '2025-05-26',
      startTime: '6:00 PM',
      duration: '3h 10m',
      subject: 'App Design Principles',
      topic: 'User Interface & Experience',
      notes: 'Sketched wireframes for the new feed layout.',
    },
    {
      id: '5',
      date: '2025-05-25',
      startTime: '11:00 AM',
      duration: '2h 00m',
      subject: 'React Native Development',
      topic: 'State Management (Zustand)',
      notes: 'Implemented global state for user authentication.',
    },
  ]);

  // In a real app, you would fetch this data
  useEffect(() => {
    // fetchStudyLogData().then(data => setStudySessions(data));
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <Stack.Screen 
        options={{ 
          title: 'Study Log', 
          headerStyle: { backgroundColor: stensylColors.headerBackground },
          headerTintColor: stensylColors.iconWhite,
          headerTitleStyle: { color: stensylColors.textWhite },
          headerBackTitle: "",
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
          <View style={styles.emptyContainer}>
            <Text style={styles.placeholderText}>No study sessions logged yet.</Text>
            <Text style={styles.placeholderText}>Start tracking your studies!</Text>
          </View>
        }
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
    paddingBottom: 20, // Space at the end of the list
  },
  pageTitle: {
    fontSize: 24, // Made title a bit larger
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginTop: 20, // Space from header
    marginBottom: 20,
    textAlign: 'left', // Align to the left
  },
  logItemContainer: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000', // Optional shadow for depth
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
  },
  logItemDuration: {
    fontSize: 14,
    color: stensylColors.primaryAccent,
    fontWeight: '500',
  },
  logItemSubject: {
    fontSize: 16,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 4,
  },
  logItemTopic: {
    fontWeight: 'normal',
    color: stensylColors.textMuted, // Different color for topic
  },
  logItemNotes: {
    fontSize: 14,
    color: stensylColors.textMuted,
    fontStyle: 'italic',
    marginTop: 6,
    marginBottom: 8,
  },
  logItemFooter: {
    marginTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 8,
  },
  logItemStartTime: {
    fontSize: 12,
    color: stensylColors.textMuted,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50, // Give some space if the list is empty
  },
  placeholderText: {
    fontSize: 16,
    color: stensylColors.textMuted, // Use muted color
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default StudyLogScreen;
