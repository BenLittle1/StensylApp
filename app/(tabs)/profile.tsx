import React, { useState, useCallback, useMemo } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Alert, ActivityIndicator, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { stensylColors } from '@/constants/Colors';
import { Stack, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { LineChart, ContributionGraph, PieChart } from "react-native-chart-kit";
import { GoalProgress } from '@/components/GoalProgress';
import { GoalSettingModal } from '@/components/GoalSetting';
import { StensylScore } from '@/components/StensylScore';

// Local type definition for Posts, matching the data structure
interface Post {
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

// New data processing function for the line chart
const processDataForWeeklyChart = (posts: Post[]) => {
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

// New data processing function for the heat map
const processDataForHeatMap = (posts: Post[]) => {
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

// New data processing function for the pie chart
const processDataForPieChart = (posts: Post[]) => {
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
  color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Primary chart color
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  style: {
    borderRadius: 16,
  },
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: stensylColors.primaryAccent, // Dot color
  },
};

// New chart config for the Heat Map
const heatMapChartConfig = {
  backgroundGradientFrom: stensylColors.cardBackground,
  backgroundGradientTo: stensylColors.cardBackground,
  color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

// New chart config for Pie Chart
const pieChartConfig = {
  color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
};

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [goalModalVisible, setGoalModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchUserPosts = async () => {
        if (!user) {
          if (isActive) setLoading(false);
          return;
        }
        // Only set loading true on the initial fetch for a smoother UX on re-focus
        if (posts.length === 0) {
            setLoading(true);
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
          if (isActive) Alert.alert('Error fetching stats', error.message);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchUserPosts();

      return () => {
        isActive = false;
      };
    }, [user, posts.length])
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

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Sign Out Failed', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerRight: () => (
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={stensylColors.primaryAccent} />
        </View>
      ) : (
        <ScrollView style={styles.contentScrollView}>
          <Text style={styles.title}>{user?.user_metadata?.full_name || 'Your Profile'}</Text>
          
          <View style={styles.statsContainer}>
            <StatBox label="Total Time" value={formatTotalTime(totalSecondsStudied)} />
            <StatBox label="Sessions" value={totalSessions} />
            <StatBox label="Avg. Session" value={`${formatTotalTime(averageSessionSeconds)}`} />
          </View>

          {/* Stensyl Score Section */}
          <View style={styles.goalsSection}>
            <Text style={styles.sectionTitle}>Your Stensyl Score</Text>
            <StensylScore showLeaderboard={true} />
          </View>

          {/* Goals Section */}
          <View style={styles.goalsSection}>
            <Text style={styles.sectionTitle}>Your Goals</Text>
            <GoalProgress onSetGoalPress={() => setGoalModalVisible(true)} />
          </View>

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

          <Text style={styles.userInfo}>
            Signed in as: {user?.email}
          </Text>
        </ScrollView>
      )}
      
      {/* Goal Setting Modal */}
      <GoalSettingModal
        visible={goalModalVisible}
        onClose={() => setGoalModalVisible(false)}
        onGoalSet={() => {
          // Modal will close automatically after setting goal
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
  contentScrollView: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 30, // Increased margin
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
  },
  statLabel: {
    fontSize: 14,
    color: stensylColors.textMuted,
    marginTop: 4,
  },
  userInfo: {
    fontSize: 14,
    color: stensylColors.textMuted,
    marginTop: 40, // Added margin to push it down
  },
  signOutButton: {
    marginRight: 16,
    padding: 8,
  },
  signOutButtonText: {
    color: stensylColors.primaryAccent,
    fontSize: 16,
  },
  centered: { // New style for centering the loader
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartsScrollView: {
    marginTop: 20,
    maxHeight: 300, // Or whatever height you prefer
  },
  chartContainer: {
    width: screenWidth, // Each chart takes the full screen width
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
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
  goalsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 16,
    marginLeft: 16,
  },
}); 