import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';
import { useRouter } from 'expo-router';

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

interface RecentSessionsProps {
  posts: SupabasePost[];
  compact?: boolean;
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
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

export const RecentSessions: React.FC<RecentSessionsProps> = ({ 
  posts, 
  compact = false 
}) => {
  const router = useRouter();

  // Calculate recent session statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const todayPosts = posts.filter(post => {
    const postDate = new Date(post.created_at);
    postDate.setHours(0, 0, 0, 0);
    return postDate.getTime() === today.getTime();
  });

  const recentPosts = posts.slice(0, 3); // Last 3 sessions
  
  const todayMinutes = todayPosts.reduce((acc, post) => acc + parseDuration(post.duration) / 60, 0);
  const todaySessions = todayPosts.length;

  if (posts.length === 0) {
    return (
      <View style={compact ? styles.compactEmptyContainer : styles.emptyContainer}>
        <MaterialIcons name="history" size={compact ? 20 : 24} color={stensylColors.textMuted} />
        <Text style={compact ? styles.compactEmptyText : styles.emptyText}>
          No study sessions yet
        </Text>
        <TouchableOpacity 
          style={compact ? styles.compactStartButton : styles.startButton}
          onPress={() => router.push('/(tabs)/study')}
        >
          <Text style={styles.startButtonText}>Start Studying</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <View style={styles.compactHeader}>
          <MaterialIcons name="history" size={18} color={stensylColors.primaryAccent} />
          <Text style={styles.compactTitle}>Today</Text>
        </View>
        <View style={styles.compactStats}>
          <View style={styles.compactStatItem}>
            <Text style={styles.compactStatValue}>{Math.round(todayMinutes)}m</Text>
            <Text style={styles.compactStatLabel}>studied</Text>
          </View>
          <View style={styles.compactStatItem}>
            <Text style={styles.compactStatValue}>{todaySessions}</Text>
            <Text style={styles.compactStatLabel}>sessions</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Recent Sessions</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/profile')}>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.todayStats}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{Math.round(todayMinutes)}m</Text>
          <Text style={styles.statLabel}>Today</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{todaySessions}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>
      </View>

      {recentPosts.length > 0 && (
        <View style={styles.recentList}>
          {recentPosts.map((post, index) => {
            const timeAgo = getTimeAgo(post.created_at);
            const duration = formatTotalTime(parseDuration(post.duration));
            
            return (
              <View key={post.id} style={styles.recentItem}>
                <View style={styles.recentItemLeft}>
                  <Text style={styles.recentSubject}>{post.subject}</Text>
                  <Text style={styles.recentTime}>{timeAgo}</Text>
                </View>
                <Text style={styles.recentDuration}>{duration}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

// Helper function to get time ago string
const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInHours = Math.floor((now.getTime() - postDate.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) {
    return 'Just now';
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  compactContainer: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  compactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: stensylColors.textWhite,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginLeft: 6,
  },
  viewAllText: {
    fontSize: 14,
    color: stensylColors.primaryAccent,
    fontWeight: '500',
  },
  todayStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  compactStats: {
    flexDirection: 'row',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  compactStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
  },
  compactStatValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
  },
  statLabel: {
    fontSize: 12,
    color: stensylColors.textMuted,
    marginTop: 2,
  },
  compactStatLabel: {
    fontSize: 10,
    color: stensylColors.textMuted,
    marginTop: 2,
  },
  recentList: {
    borderTopWidth: 1,
    borderTopColor: stensylColors.inputBackground,
    paddingTop: 12,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  recentItemLeft: {
    flex: 1,
  },
  recentSubject: {
    fontSize: 14,
    fontWeight: '500',
    color: stensylColors.textWhite,
  },
  recentTime: {
    fontSize: 12,
    color: stensylColors.textMuted,
    marginTop: 2,
  },
  recentDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: stensylColors.primaryAccent,
  },
  emptyContainer: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  compactEmptyContainer: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: stensylColors.textMuted,
    marginTop: 8,
    marginBottom: 12,
  },
  compactEmptyText: {
    fontSize: 12,
    color: stensylColors.textMuted,
    marginTop: 6,
    marginBottom: 8,
  },
  startButton: {
    backgroundColor: stensylColors.primaryAccent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  compactStartButton: {
    backgroundColor: stensylColors.primaryAccent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  startButtonText: {
    color: stensylColors.textWhite,
    fontSize: 14,
    fontWeight: '600',
  },
}); 