import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, Text, View, ActivityIndicator, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { stensylColors } from '@/constants/Colors';
import { Stack, useFocusEffect } from 'expo-router';
import { StudyReminders } from '@/components/StudyReminders';
import { Achievements } from '@/components/Achievements';
import { GoalProgress } from '@/components/GoalProgress';
import { GoalSettingModal } from '@/components/GoalSetting';
import { PerformanceIndex } from '@/components/PerformanceIndex';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { LineChart, ContributionGraph, PieChart } from "react-native-chart-kit";

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

// Helper to parse HH:MM:SS string to seconds
const parseDuration = (duration: string): number => {
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
};

// Helper to format total seconds into a readable string
const formatTotalTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const StatBox = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

// Data processing function for the line chart
const processDataForWeeklyChart = (posts: SupabasePost[]) => {
  const labels = [];
  const data = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    
    const postsOnDay = posts.filter(post => {
      const postDate = new Date(post.created_at);
      return postDate.getFullYear() === d.getFullYear() &&
             postDate.getMonth() === d.getMonth() &&
             postDate.getDate() === d.getDate();
    });

    const totalMinutes = postsOnDay.reduce((acc, post) => acc + parseDuration(post.duration) / 60, 0);
    data.push(Math.round(totalMinutes));
  }
  
  return {
    labels,
    datasets: [{ data }]
  };
};

// Data processing function for the heat map
const processDataForHeatMap = (posts: SupabasePost[]) => {
  const commitsData = [];
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);

    const postsOnDay = posts.filter(post => {
      const postDate = new Date(post.created_at);
      return postDate.getFullYear() === d.getFullYear() &&
             postDate.getMonth() === d.getMonth() &&
             postDate.getDate() === d.getDate();
    });

    if (postsOnDay.length > 0) {
      const totalMinutes = postsOnDay.reduce((acc, post) => acc + parseDuration(post.duration) / 60, 0);
      commitsData.push({ date: d, count: Math.round(totalMinutes) });
    }
  }

  return commitsData;
};

// Data processing function for the pie chart
const processDataForPieChart = (posts: SupabasePost[]) => {
  if (posts.length === 0) return [];
  const subjectTimes: { [key: string]: number } = {};

  posts.forEach(post => {
    const subject = post.subject || 'Uncategorized';
    const minutes = parseDuration(post.duration) / 60;
    subjectTimes[subject] = (subjectTimes[subject] || 0) + minutes;
  });

  // Pre-defined colors for consistency
  const pieColors = ["#E63946", "#F1FAEE", "#A8DADC", "#457B9D", "#1D3557", "#2a9d8f", "#e9c46a", "#f4a261", "#e76f51"];

  return Object.keys(subjectTimes).map((subject, index) => ({
    name: subject,
    population: Math.round(subjectTimes[subject]),
    color: pieColors[index % pieColors.length],
    legendFontColor: stensylColors.textWhite,
    legendFontSize: 14,
  }));
};

// Chart visual configuration
const chartConfig = {
  backgroundColor: stensylColors.cardBackground,
  backgroundGradientFrom: stensylColors.cardBackground,
  backgroundGradientTo: stensylColors.cardBackground,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: stensylColors.primaryAccent,
  },
};

// Chart config for the Heat Map
const heatMapChartConfig = {
  backgroundGradientFrom: stensylColors.cardBackground,
  backgroundGradientTo: stensylColors.cardBackground,
  color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

// Chart config for Pie Chart
const pieChartConfig = {
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

export default function StatsScreen() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<SupabasePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchUserPosts = async () => {
        if (!user) {
          if (isActive) {
            setLoading(false);
            setPosts([]);
          }
          return;
        }

        try {
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (isActive) {
            if (error) throw error;
            setPosts(data || []);
          }
        } catch (error: any) {
          if (isActive) console.error('Error fetching posts for stats:', error);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchUserPosts();

      return () => {
        isActive = false;
      };
    }, [user, refreshTrigger])
  );

  const totalSessions = posts.length;
  const totalSecondsStudied = posts.reduce((acc, post) => acc + parseDuration(post.duration), 0);
  const averageSessionSeconds = totalSessions > 0 ? totalSecondsStudied / totalSessions : 0;

  // Memoize the chart data calculation
  const weeklyChartData = useMemo(() => {
    if (posts.length === 0) {
      return {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{ data: [0, 0, 0, 0, 0, 0, 0] }]
      };
    }
    return processDataForWeeklyChart(posts);
  }, [posts]);
  
  // Memoize heat map data calculation
  const heatMapData = useMemo(() => {
    if (posts.length === 0) return [];
    return processDataForHeatMap(posts);
  }, [posts]);

  // Memoize pie chart data calculation
  const pieChartData = useMemo(() => {
    return processDataForPieChart(posts);
  }, [posts]);

  const handleEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setGoalModalVisible(true);
  };

  const handleDeleteGoal = async (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('goals')
                .update({ is_active: false })
                .eq('id', goalId);

              if (error) throw error;

              // Trigger refresh to update the goals display
              setRefreshTrigger(prev => prev + 1);
              Alert.alert('Success', 'Goal deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete goal: ' + error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          headerShown: false,
          title: 'Analytics & Stats'
        }} 
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={stensylColors.primaryAccent} />
          <Text style={styles.loadingText}>Loading your stats...</Text>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          <Text style={styles.title}>Your Analytics</Text>
          
          {/* Overall Stats */}
          <View style={styles.statsContainer}>
            <StatBox label="Total Time" value={formatTotalTime(totalSecondsStudied)} />
            <StatBox label="Sessions" value={totalSessions} />
            <StatBox label="Avg. Session" value={`${formatTotalTime(averageSessionSeconds)}`} />
          </View>

          {/* Performance Index Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Performance Index</Text>
            <PerformanceIndex posts={posts} showLeaderboard={true} />
          </View>

          {/* Goals Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Goals</Text>
            <GoalProgress 
              onSetGoalPress={() => {
                setEditingGoal(null);
                setGoalModalVisible(true);
              }}
              onEditGoal={handleEditGoal}
              onDeleteGoal={handleDeleteGoal}
            />
          </View>

          {/* Charts Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Study Analytics</Text>
            
            {/* Horizontal ScrollView for Charts */}
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              style={styles.chartsScrollView}
            >
              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Weekly Progress (minutes)</Text>
                <LineChart
                  data={weeklyChartData}
                  width={screenWidth - 32}
                  height={220}
                  yAxisSuffix="m"
                  chartConfig={chartConfig}
                  bezier
                  style={styles.chartStyle}
                />
              </View>

              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Yearly Study Activity</Text>
                <ContributionGraph
                  values={heatMapData}
                  endDate={new Date()}
                  numDays={105}
                  width={screenWidth}
                  height={220}
                  chartConfig={heatMapChartConfig}
                  tooltipDataAttrs={() => ({})}
                />
              </View>

              <View style={styles.chartContainer}>
                <Text style={styles.chartTitle}>Subject Breakdown (minutes)</Text>
                {pieChartData.length > 0 ? (
                  <PieChart
                    data={pieChartData}
                    width={screenWidth}
                    height={220}
                    chartConfig={pieChartConfig}
                    accessor={"population"}
                    backgroundColor={"transparent"}
                    paddingLeft={"15"}
                    center={[10, 0]}
                    absolute
                  />
                ) : (
                  <Text style={styles.noDataText}>No data for this chart yet.</Text>
                )}
              </View>
            </ScrollView>
          </View>

          {/* Achievements Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Achievements</Text>
            <Achievements posts={posts} />
          </View>

          {/* Study Reminders Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Study Settings</Text>
            <StudyReminders />
          </View>
        </ScrollView>
      )}
      
      {/* Goal Setting Modal */}
      <GoalSettingModal
        visible={goalModalVisible}
        onClose={() => {
          setGoalModalVisible(false);
          setEditingGoal(null);
        }}
        onGoalSet={() => {
          setEditingGoal(null);
          setRefreshTrigger(prev => prev + 1);
        }}
      />
    </SafeAreaView>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: stensylColors.textMuted,
    marginTop: 12,
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 20,
    marginTop: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
  },
  statLabel: {
    fontSize: 12,
    color: stensylColors.textMuted,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 16,
  },
  chartsScrollView: {
    marginTop: 12,
    maxHeight: 300,
  },
  chartContainer: {
    width: screenWidth,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 10,
  },
  chartStyle: {
    marginVertical: 8,
    borderRadius: 16,
  },
  noDataText: {
    color: stensylColors.textMuted,
    marginTop: 20,
    fontStyle: 'italic',
  },
}); 