import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
  user_id: string;
  user_name: string;
  total_sessions: number;
  total_duration_seconds: number;
  average_efficiency: number;
  favorite_subject: string;
  recent_activity_count: number;
  stensyl_score: number;
  current_streak: number;
}

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  userId,
  userName,
}) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && userId) {
      fetchUserProfile();
    }
  }, [visible, userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      // Get user's study statistics
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (posts && posts.length > 0) {
        // Calculate statistics
        const totalSessions = posts.length;
        const totalDurationSeconds = posts.reduce((acc, post) => {
          const parts = post.duration.split(':').map(Number);
          return acc + (parts[0] * 3600 + parts[1] * 60 + parts[2]);
        }, 0);

        const efficiencyScores = posts.filter(p => p.efficiency).map(p => p.efficiency);
        const averageEfficiency = efficiencyScores.length > 0 
          ? efficiencyScores.reduce((a, b) => a + b, 0) / efficiencyScores.length 
          : 0;

        // Find most common subject
        const subjectCounts = posts.reduce((acc, post) => {
          acc[post.subject] = (acc[post.subject] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        const favoriteSubject = Object.keys(subjectCounts).reduce((a, b) => 
          subjectCounts[a] > subjectCounts[b] ? a : b
        );

        // Recent activity (last 7 days)
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const recentActivity = posts.filter(post => 
          new Date(post.created_at) > weekAgo
        ).length;

        // Mock Stensyl score and streak (we can implement these later)
        const stensylScore = Math.min(1000, totalSessions * 50 + Math.floor(averageEfficiency * 10));
        const currentStreak = Math.min(30, Math.floor(totalSessions / 3));

        setProfile({
          user_id: userId,
          user_name: userName,
          total_sessions: totalSessions,
          total_duration_seconds: totalDurationSeconds,
          average_efficiency: averageEfficiency,
          favorite_subject: favoriteSubject,
          recent_activity_count: recentActivity,
          stensyl_score: stensylScore,
          current_streak: currentStreak,
        });
      } else {
        // No public posts
        setProfile({
          user_id: userId,
          user_name: userName,
          total_sessions: 0,
          total_duration_seconds: 0,
          average_efficiency: 0,
          favorite_subject: 'No data',
          recent_activity_count: 0,
          stensyl_score: 0,
          current_streak: 0,
        });
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const isOwnProfile = user?.id === userId;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color={stensylColors.textWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isOwnProfile ? 'Your Profile' : `${userName}'s Profile`}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={stensylColors.primaryAccent} />
          </View>
        ) : profile ? (
          <ScrollView style={styles.content}>
            {/* Profile Header */}
            <View style={styles.profileHeader}>
              <Text style={styles.userName}>{profile.user_name}</Text>
              {profile.stensyl_score > 0 && (
                <Text style={styles.score}>Stensyl Score: {profile.stensyl_score}</Text>
              )}
            </View>

            {/* Main Stats */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile.total_sessions}</Text>
                <Text style={styles.statLabel}>Sessions</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{formatDuration(profile.total_duration_seconds)}</Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{profile.current_streak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{Math.round(profile.average_efficiency * 10)}%</Text>
                <Text style={styles.statLabel}>Avg. Focus</Text>
              </View>
            </View>

            {/* Additional Info */}
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Favorite Subject:</Text>
                <Text style={styles.infoValue}>{profile.favorite_subject}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Recent Activity:</Text>
                <Text style={styles.infoValue}>{profile.recent_activity_count} sessions this week</Text>
              </View>
            </View>

            {profile.total_sessions === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {isOwnProfile 
                    ? "Start studying to build your profile!" 
                    : `${profile.user_name} hasn't shared any study sessions yet.`
                  }
                </Text>
              </View>
            )}
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: stensylColors.textWhite,
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 8,
  },
  score: {
    fontSize: 16,
    color: stensylColors.primaryAccent,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 32,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: stensylColors.textMuted,
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: stensylColors.textMuted,
  },
  infoValue: {
    fontSize: 14,
    color: stensylColors.textWhite,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: stensylColors.textMuted,
    textAlign: 'center',
    lineHeight: 24,
  },
}); 