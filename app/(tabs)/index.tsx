import { MaterialIcons } from '@expo/vector-icons';
import React, { useState, useCallback, useMemo } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { stensylColors } from '@/constants/Colors';
import DayBox from '@/components/DayBox';
import PostItem from '@/components/PostItem';
import type { PostItemProps } from '@/components/PostItem';
import { supabase } from '@/lib/supabase';
import { FeedEmptyState } from '@/components/EmptyState';
import { FeedLoadingState } from '@/components/LoadingStates';
import { GoalProgress } from '@/components/GoalProgress';
import { GoalSettingModal } from '@/components/GoalSetting';
import { RecentSessions } from '@/components/RecentSessions';
import { StudyStatusBadge } from '@/components/StudyStatusBadge';
import { StudyTemplates } from '@/components/StudyTemplates';
import { StudyExport } from '@/components/StudyExport';
import { SocialFeed } from '@/components/SocialFeed';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    userId: post.user_id, // This was already here, which is good
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

// Add new interface for today's stats
interface TodayStats {
  totalMinutes: number;
  sessionCount: number;
  topSubject: string;
  efficiencyAvg: number;
}

// Add function to calculate today's stats
const calculateTodayStats = (posts: SupabasePost[]): TodayStats => {
  const today = new Date().toDateString();
  const todayPosts = posts.filter(post => 
    new Date(post.created_at).toDateString() === today
  );

  if (todayPosts.length === 0) {
    return { totalMinutes: 0, sessionCount: 0, topSubject: '', efficiencyAvg: 0 };
  }

  const totalMinutes = todayPosts.reduce((acc, post) => {
    const [hours, minutes, seconds] = post.duration.split(':').map(Number);
    return acc + (hours * 60) + minutes + (seconds / 60);
  }, 0);

  const subjectCounts: { [key: string]: number } = {};
  todayPosts.forEach(post => {
    subjectCounts[post.subject] = (subjectCounts[post.subject] || 0) + 1;
  });
  
  const topSubject = Object.keys(subjectCounts).reduce((a, b) => 
    subjectCounts[a] > subjectCounts[b] ? a : b, ''
  );

  const efficiencyAvg = todayPosts.reduce((acc, post) => 
    acc + (post.efficiency || 0), 0) / todayPosts.length;

  return {
    totalMinutes: Math.round(totalMinutes),
    sessionCount: todayPosts.length,
    topSubject,
    efficiencyAvg: Math.round(efficiencyAvg * 10) / 10
  };
};

export default function FeedScreen() {
  const router = useRouter();
  const [posts, setPosts] = useState<SupabasePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);

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
            
            // Check if this is a first-time user
            if ((data || []).length === 0) {
              const hasSeenWelcome = await AsyncStorage.getItem('@has_seen_welcome');
              if (!hasSeenWelcome) {
                setShowWelcome(true);
              }
            }
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

  const handleDismissWelcome = async () => {
    await AsyncStorage.setItem('@has_seen_welcome', 'true');
    setShowWelcome(false);
  };

  // New handler for deleting a post from the state
  const handleDeletePost = (deletedPostId: string) => {
    console.log('🟦 handleDeletePost called with ID:', deletedPostId);
    console.log('🟦 Current posts before filter:', posts.map(p => p.id));
    
    setPosts(currentPosts => {
      console.log('🟦 Posts being filtered:', currentPosts.map(p => p.id));
      const filtered = currentPosts.filter(post => post.id !== deletedPostId);
      console.log('🟦 Posts after filter:', filtered.map(p => p.id));
      return filtered;
    });
  };

  // Add today's stats calculation
  const todayStats = useMemo(() => calculateTodayStats(posts), [posts]);

  const userStats = useMemo(() => {
    const studyStreak = calculateStudyStreak(posts);
    const last7DaysBools = [];
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
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
      currentDayIndex: 6, // Today is always the last index in our 7-day array
    };
  }, [posts]);

  // Pass userId and onDelete to the transformed data
  const transformedPosts = posts.map(post => ({
    ...transformSupabasePost(post),
    onDelete: handleDeletePost,
  }));

  if (loading && posts.length === 0) {
    return <FeedLoadingState />;
  }

  return (
    <>
    <FlatList
      style={styles.screenBackground}
      data={transformedPosts}
      renderItem={({ item }) => <PostItem {...item} />}
      keyExtractor={(item) => item.id}
        ListEmptyComponent={!loading ? <FeedEmptyState /> : null}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={stensylColors.textWhite}
        />
      }
      ListHeaderComponent={
        <View style={styles.feedHeaderContent}>
            {/* Study Status Badge - shows when actively studying */}
            <StudyStatusBadge isStudying={false} compact={true} />

          {/* Today's Focus Section */}
          <View style={styles.todayFocusContainer}>
            <Text style={styles.sectionTitle}>Today's Progress</Text>
            <View style={styles.todayStatsGrid}>
              <View style={styles.todayStatCard}>
                <Text style={styles.todayStatValue}>{Math.floor(todayStats.totalMinutes / 60)}h {todayStats.totalMinutes % 60}m</Text>
                <Text style={styles.todayStatLabel}>Studied</Text>
              </View>
              <View style={styles.todayStatCard}>
                <Text style={styles.todayStatValue}>{todayStats.sessionCount}</Text>
                <Text style={styles.todayStatLabel}>Sessions</Text>
              </View>
              <View style={styles.todayStatCard}>
                <Text style={styles.todayStatValue}>{todayStats.topSubject || 'None'}</Text>
                <Text style={styles.todayStatLabel}>Top Subject</Text>
              </View>
              <View style={styles.todayStatCard}>
                <Text style={styles.todayStatValue}>{todayStats.efficiencyAvg || 'N/A'}</Text>
                <Text style={styles.todayStatLabel}>Avg Efficiency</Text>
              </View>
            </View>
          </View>

          <View style={styles.weeklyProgressContainer}>
            <View style={styles.dayBoxesContainer}>
              {["S", "M", "T", "W", "T", "F", "S"].map((initial, index) => {
                  // This shows activity for the last 7 calendar days
                  return (
                    <DayBox
                      key={index}
                      dayInitial={initial}
                      studied={userStats.weeklyStudyDays[index]}
                      isCurrentDay={index === userStats.currentDayIndex} // Highlight today
                    />
                  )
              })}
            </View>
            <View style={styles.streakInfoContainer}>
              <MaterialIcons name="local-fire-department" size={22} color={stensylColors.primaryAccent} style={styles.streakIcon} />
              <Text style={styles.streakText}>{userStats.studyStreak}</Text>
            </View>
          </View>
            
            {/* Goals Section */}
            <GoalProgress 
              compact={true} 
              onSetGoalPress={() => setGoalModalVisible(true)} 
            />

            {/* Study Templates */}
            <StudyTemplates 
              compact={true}
              onTemplateSelect={(template) => {
                // Navigate to study page with template pre-selected
                console.log('Selected template:', template);
                // For now, just navigate to the study tab
                // TODO: In the future, we can pass parameters to pre-fill session data
                router.push('/(tabs)/study');
              }}
            />

            {/* Recent Activity Section */}
            <View style={styles.socialSection}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <View style={styles.socialFeedContainer}>
                <SocialFeed compact={true} maxItems={3} />
              </View>
            </View>

            {/* Recent Sessions Summary */}
            <RecentSessions posts={posts} compact={true} />
        </View>
      }
      contentContainerStyle={styles.feedListContainer}
    />
      
      {/* Goal Setting Modal */}
      <GoalSettingModal
        visible={goalModalVisible}
        onClose={() => setGoalModalVisible(false)}
        onGoalSet={() => {
          // Refresh goals when a new one is set
          setRefreshing(true);
        }}
      />

      {/* Export/Share Modal */}
      <StudyExport
        posts={posts}
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
      />
      
      {/* Welcome Modal */}
      <Modal
        visible={showWelcome}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.welcomeModalOverlay}>
          <View style={styles.welcomeModal}>
            <Text style={styles.welcomeTitle}>Welcome to Stensyl! 🎯</Text>
            <Text style={styles.welcomeText}>
              Track your study sessions, set goals, and build consistent learning habits.
            </Text>
            <Text style={styles.welcomeSubtext}>
              ✨ Start by tapping the Study tab to begin your first session
            </Text>
            <TouchableOpacity 
              style={styles.welcomeButton} 
              onPress={handleDismissWelcome}
            >
              <Text style={styles.welcomeButtonText}>Get Started</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
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
  todayFocusContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 12,
  },
  todayStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  todayStatCard: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 8,
    padding: 12,
    width: '48%',
    marginBottom: 8,
    alignItems: 'center',
  },
  todayStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 4,
  },
  todayStatLabel: {
    fontSize: 12,
    color: stensylColors.textMuted,
  },

  // Welcome modal styles
  welcomeModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeModal: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 16,
    padding: 24,
    margin: 20,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 16,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: stensylColors.textWhite,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 22,
  },
  welcomeSubtext: {
    fontSize: 14,
    color: stensylColors.textMuted,
    textAlign: 'center',
    marginBottom: 24,
    fontStyle: 'italic',
  },
  welcomeButton: {
    backgroundColor: stensylColors.primaryAccent,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  welcomeButtonText: {
    color: stensylColors.textWhite,
    fontSize: 16,
    fontWeight: '600',
  },
  
  socialSection: {
    marginBottom: 24,
  },
  socialFeedContainer: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    overflow: 'hidden',
  },
});
