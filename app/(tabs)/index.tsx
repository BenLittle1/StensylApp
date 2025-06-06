import { MaterialIcons } from '@expo/vector-icons';
import React, { useState, useCallback, useMemo } from 'react';
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
import PostItem from '@/components/PostItem';
import type { PostItemProps } from '@/components/PostItem';
import { supabase } from '@/lib/supabase';

// Define the structure of posts coming directly from Supabase DB
interface SupabasePost {
  id: string;
  user_id: string;
  user_name: string | null;
  created_at: string;
  topic: string;
  subject: string;
  duration: string;
  notes: string | null;
  mode: string | null;
  efficiency: number | null;
}

const transformSupabasePost = (post: SupabasePost): Omit<PostItemProps, 'onDelete'> => {
  return {
    id: post.id,
    userName: post.user_name || 'Anonymous',
    timestamp: new Date(post.created_at).toLocaleString(),
    location: "Online",
    timeStudied: post.duration,
    description: `${post.topic}\nSubject: ${post.subject}${post.notes ? `\nNotes: ${post.notes}` : ''}`,
    userId: post.user_id,
  };
};

const calculateStudyStreak = (posts: SupabasePost[]): number => {
    if (posts.length === 0) return 0;
  
    const studyDates = [
      ...new Set(
        posts.map((post) => new Date(post.created_at).toISOString().split('T')[0])
      ),
    ].sort((a, b) => b.localeCompare(a));
  
    if (studyDates.length === 0) return 0;
  
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const firstStudyDate = new Date(studyDates[0]);
    firstStudyDate.setHours(0, 0, 0, 0);
  
    const diffFromToday = (today.getTime() - firstStudyDate.getTime()) / (1000 * 60 * 60 * 24);
  
    if (diffFromToday > 1) {
      return 0; // The last study session was not today or yesterday, so streak is broken.
    }
  
    streak = 1;
    for (let i = 0; i < studyDates.length - 1; i++) {
      const currentDay = new Date(studyDates[i]);
      const nextDay = new Date(studyDates[i + 1]);
      const diffTime = currentDay.getTime() - nextDay.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
      if (diffDays === 1) {
        streak++;
      } else {
        break; 
      }
    }
    return streak;
};

export default function FeedScreen() {
  const [posts, setPosts] = useState<SupabasePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchPosts = async () => {
        if (!refreshing) {
            setLoading(true);
        }
        try {
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .order('created_at', { ascending: false });

          if (isActive) {
            if (error) throw error;
            setPosts(data || []);
          }
        } catch (e: any) {
          if (isActive) console.error("Failed to fetch posts from Supabase", e);
        } finally {
          if (isActive) {
            setLoading(false);
            setRefreshing(false);
          }
        }
      };

      fetchPosts();

      return () => {
        isActive = false;
      };
    }, [refreshing])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
  }, []);

  // New handler for deleting a post from the state
  const handleDeletePost = (deletedPostId: string) => {
    setPosts(currentPosts => currentPosts.filter(post => post.id !== deletedPostId));
  };

  const userStats = useMemo(() => {
    const studyStreak = calculateStudyStreak(posts);
    const last7DaysBools = [];
    for(let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setHours(0,0,0,0);
        d.setDate(d.getDate() - i);
        last7DaysBools.push(
            posts.some(p => {
                const pDate = new Date(p.created_at);
                pDate.setHours(0,0,0,0);
                return pDate.getTime() === d.getTime();
            })
        )
    }

    return {
      studyStreak,
      weeklyStudyDays: last7DaysBools,
    };
  }, [posts]);

  // Pass userId and onDelete to the transformed data
  const transformedPosts = posts.map(post => ({
    ...transformSupabasePost(post),
    onDelete: handleDeletePost,
  }));

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
      data={transformedPosts}
      renderItem={({ item }) => <PostItem {...item} />}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        !loading ? (
          <View style={styles.emptyFeedContainer}>
            <Text style={styles.emptyFeedText}>No study sessions yet.</Text>
            <Text style={styles.emptyFeedSubText}>Go to the "Study" tab to log your first session!</Text>
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
          <View style={styles.weeklyProgressContainer}>
            <View style={styles.dayBoxesContainer}>
              {["S", "M", "T", "W", "T", "F", "S"].map((initial, index) => {
                  const dayIndex = new Date().getDay();
                  // Simplified mapping, could be more robust
                  const displayDays = ['S','M','T','W','T','F','S'];
                  const todayIndex = new Date().getDay();
                  // This is a simple visual mapping, not a calendar.
                  // It shows activity for the last 7 calendar days.
                  return (
                    <DayBox
                      key={index}
                      dayInitial={displayDays[index]}
                      studied={userStats.weeklyStudyDays[index]}
                      isCurrentDay={index === 6} // The last box always represents today
                    />
                  )
              })}
            </View>
            <View style={styles.streakInfoContainer}>
              <MaterialIcons name="local-fire-department" size={22} color={stensylColors.primaryAccent} style={styles.streakIcon} />
              <Text style={styles.streakText}>{userStats.studyStreak}</Text>
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
