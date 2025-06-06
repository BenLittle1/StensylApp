import { MaterialIcons } from '@expo/vector-icons';
import React, { useState, useCallback } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { stensylColors } from '@/constants/Colors';
import DayBox from '@/components/DayBox';
import PostItem from '@/components/PostItem'; // PostItemProps is now inferred from the component
import { supabase } from '@/lib/supabase'; // Import Supabase client

// Define the structure of posts coming from the Supabase table
export interface Post {
  id: string; // uuid
  user_id: string; // uuid
  user_name: string | null;
  created_at: string; // timestamptz
  topic: string;
  subject: string;
  duration: string;
  notes: string | null;
  mode: string | null;
  efficiency: number | null;
}

// Updated transform function
const transformSupabasePost = (post: Post): any => { // Using 'any' for PostItemProps flexibility
  return {
    id: post.id,
    userName: post.user_name || 'Anonymous',
    timestamp: new Date(post.created_at).toLocaleString(),
    location: "Online", // Placeholder
    timeStudied: post.duration,
    description: `${post.topic}\nSubject: ${post.subject}${post.notes ? `\nNotes: ${post.notes}` : ''}`,
  };
};

export default function FeedScreen() {
  const [posts, setPosts] = useState<any[]>([]); // Using 'any' for now
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studyStreak, setStudyStreak] = useState(12);
  const [weeklyStudyDays, setWeeklyStudyDays] = useState([
    true, true, false, true, false, true, false
  ]);
  const dayInitials = ["M", "T", "W", "T", "F", "S", "S"];

  const jsDayOfWeek = new Date().getDay();
  let actualCurrentDayIndexInArray: number;
  if (jsDayOfWeek === 0) {
    actualCurrentDayIndexInArray = 6;
  } else {
    actualCurrentDayIndexInArray = jsDayOfWeek - 1;
  }

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false }); // Fetch newest posts first

      if (error) throw error;

      if (data) {
        setPosts(data.map(transformSupabasePost));
      }
    } catch (e: any) {
      console.error("Failed to fetch posts from Supabase", e);
      // Optionally set an error state to show in the UI
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchPosts();
    }, [])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts();
  }, []);

  if (loading && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={stensylColors.primaryAccent} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screenBackground}
      data={posts}
      renderItem={({ item }) => <PostItem {...item} />}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyFeedContainer}>
            <Text style={styles.emptyFeedText}>The feed is empty.</Text>
            <Text style={styles.emptyFeedSubText}>Be the first to post a study session!</Text>
          </View>
        ) : null
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={stensylColors.textWhite}
        />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: stensylColors.background,
  },
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
