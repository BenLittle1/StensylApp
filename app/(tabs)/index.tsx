import { MaterialIcons } from '@expo/vector-icons';
import React, { useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { stensylColors } from '@/constants/Colors';
import DayBox from '@/components/DayBox';
import PostItem, { PostItemProps } from '@/components/PostItem';

// AsyncStorage key, ensure this matches the one in StudyTrackerScreen.tsx
const ASYNC_STORAGE_STUDY_LOG_KEY = '@StudyLogSessions_StensylApp';

// Define the structure of log entries as stored by StudyTrackerScreen
interface StudyLogEntry {
  id: string;
  date: string;
  startTime: string;
  duration: string;
  subject: string;
  topic: string;
  notes?: string;
  mode?: string; // 'Stopwatch' | 'Pomodoro'
  efficiency?: number;
}

// Function to transform StudyLogEntry to PostItemProps
const transformLogEntryToPostItem = (logEntry: StudyLogEntry): PostItemProps => {
  return {
    id: logEntry.id,
    userName: "You", // Placeholder for now
    timestamp: `${logEntry.date} ${logEntry.startTime}`,
    location: "Local Session", // Placeholder for now
    timeStudied: logEntry.duration,
    description: `${logEntry.topic}\nSubject: ${logEntry.subject}${logEntry.notes ? `\nNotes: ${logEntry.notes}` : ''}`,
    // avatarUrl can be added later if available
  };
};

export default function FeedScreen() {
  const [studyStreak, setStudyStreak] = useState(12);
  const [weeklyStudyDays, setWeeklyStudyDays] = useState([
    true, true, false, true, false, true, false
  ]);
  const dayInitials = ["M", "T", "W", "T", "F", "S", "S"];

  const jsDayOfWeek = new Date().getDay(); // Sunday = 0, Monday = 1, ..., Saturday = 6
  let actualCurrentDayIndexInArray: number;
  if (jsDayOfWeek === 0) { // If today is Sunday
    actualCurrentDayIndexInArray = 6; // 'S' (Sunday) is at index 6 in your array
  } else { // If today is Monday through Saturday
    actualCurrentDayIndexInArray = jsDayOfWeek - 1; // Monday (1) -> index 0, Tuesday (2) -> index 1, etc.
  }

  const [posts, setPosts] = useState<PostItemProps[]>([]);

  // Load posts from AsyncStorage when the screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadPosts = async () => {
        try {
          const existingSessionsJson = await AsyncStorage.getItem(ASYNC_STORAGE_STUDY_LOG_KEY);
          if (existingSessionsJson) {
            const existingSessions: StudyLogEntry[] = JSON.parse(existingSessionsJson);
            // Entries are saved with newest first, so we might not need to reverse
            // If older entries are needed first, then: .reverse()
            const fetchedPosts = existingSessions.map(transformLogEntryToPostItem);
            setPosts(fetchedPosts);
          } else {
            setPosts([]); // No posts found
          }
        } catch (e) {
          console.error("Failed to load sessions from AsyncStorage", e);
          setPosts([]); // Set to empty on error
        }
      };

      loadPosts();

      return () => {
        // Optional: Cleanup function when the screen is unfocused
        // For example, if you had listeners or subscriptions
      };
    }, [])
  );

  const renderPost = ({ item }: { item: PostItemProps }) => <PostItem {...item} />;

  return (
    <FlatList
      style={styles.screenBackground}
      data={posts}
      renderItem={renderPost}
      keyExtractor={item => item.id}
      ListEmptyComponent={
        <View style={styles.emptyFeedContainer}>
          <Text style={styles.emptyFeedText}>No study sessions logged yet.</Text>
          <Text style={styles.emptyFeedSubText}>Go to the "Study" tab to track a new session!</Text>
        </View>
      }
      ListHeaderComponent={
        <View style={styles.feedHeaderContent}>
          {/* Weekly Progress Section */}
          <View style={styles.weeklyProgressContainer}>
            <View style={styles.dayBoxesContainer}>
              {dayInitials.map((initial, index) => (
                <DayBox
                  key={index}
                  dayInitial={initial}
                  studied={weeklyStudyDays[index]}
                  isCurrentDay={index === actualCurrentDayIndexInArray}
                />
              ))}
            </View>
            <View style={styles.streakInfoContainer}>
              <MaterialIcons name="local-fire-department" size={22} color={stensylColors.primaryAccent} style={styles.streakIcon} />
              <Text style={styles.streakText}>{studyStreak}</Text>
            </View>
          </View>
        </View>
      }
      contentContainerStyle={styles.feedListContainer}
    />
  );
}

const pageHorizontalPadding = 16;

const styles = StyleSheet.create({
  screenBackground: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  feedHeaderContent: {
    paddingHorizontal: pageHorizontalPadding,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: stensylColors.background,
  },
  weeklyProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: pageHorizontalPadding,
    marginBottom: 16,
  },
  dayBoxesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    marginRight: 5,
  },
  streakText: {
    color: stensylColors.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  feedListContainer: {
    paddingBottom: 10,
    flexGrow: 1,
  },
  emptyFeedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyFeedText: {
    fontSize: 18,
    color: stensylColors.textWhite,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyFeedSubText: {
    fontSize: 14,
    color: stensylColors.textMuted,
    textAlign: 'center',
  },
});
