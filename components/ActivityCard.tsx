import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface ActivityCardProps {
  id: string;
  userName: string;
  title?: string;
  duration: string;
  subject: string;
  efficiency?: number;
  motivationLevel?: number;
  notes?: string;
  timestamp: string;
  userId: string;
  fireCount: number;
  clapCount: number;
  userStensylScore?: number;
  userStreak?: number;
  onReactionUpdate?: () => void;
  onProfilePress?: (userId: string, userName: string) => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  id,
  userName,
  title,
  duration,
  subject,
  efficiency,
  motivationLevel,
  notes,
  timestamp,
  userId,
  fireCount: initialFireCount,
  clapCount: initialClapCount,
  userStensylScore,
  userStreak,
  onReactionUpdate,
  onProfilePress,
}) => {
  const { user } = useAuth();
  const [fireCount, setFireCount] = useState(initialFireCount);
  const [clapCount, setClapCount] = useState(initialClapCount);
  const [isReacting, setIsReacting] = useState(false);

  // Parse duration for display
  const formatDuration = (duration: string): string => {
    const parts = duration.split(':');
    if (parts.length === 3) {
      const hours = parseInt(parts[0]);
      const minutes = parseInt(parts[1]);
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    }
    return duration;
  };

  // Format timestamp for display
  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };

  // Handle reaction toggle
  const handleReaction = async (reactionType: 'fire' | 'clap') => {
    if (!user || isReacting) return;

    setIsReacting(true);
    try {
      const { data, error } = await supabase.rpc('toggle_reaction', {
        post_uuid: id,
        reaction_type_param: reactionType,
      });

      if (error) throw error;

      // Update local counts based on whether reaction was added or removed
      if (reactionType === 'fire') {
        setFireCount(prev => data ? prev + 1 : prev - 1);
      } else {
        setClapCount(prev => data ? prev + 1 : prev - 1);
      }

      onReactionUpdate?.();
    } catch (error: any) {
      console.error('Reaction error:', error);
      Alert.alert('Error', 'Failed to react. Please try again.');
    } finally {
      setIsReacting(false);
    }
  };

  // Get efficiency indicator
  const getEfficiencyColor = (eff?: number): string => {
    if (!eff) return stensylColors.textMuted;
    if (eff >= 8) return '#10B981'; // Green
    if (eff >= 6) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  return (
    <View style={styles.card}>
      {/* Main Content */}
      <View style={styles.content}>
        {/* Title/Topic */}
        <Text style={styles.title}>
          {title || 'Study Session'}
        </Text>
        
        {/* Study Metrics */}
        <View style={styles.metrics}>
          <Text style={styles.duration}>{formatDuration(duration)}</Text>
          <View style={styles.separator} />
          <Text style={styles.subject}>{subject}</Text>
          {efficiency && (
            <>
              <View style={styles.separator} />
              <View style={styles.efficiencyContainer}>
                <Text style={[styles.efficiency, { color: getEfficiencyColor(efficiency) }]}>
                  {efficiency * 10}% focus
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Notes (if provided) */}
        {notes && (
          <Text style={styles.notes} numberOfLines={2}>
            "{notes}"
          </Text>
        )}
      </View>

      {/* User Info & Reactions Footer */}
      <View style={styles.footer}>
        <View style={styles.userInfo}>
          <TouchableOpacity 
            onPress={() => onProfilePress?.(userId, userName)}
            style={styles.userNameContainer}
          >
            <Text style={styles.userName}>{userName}</Text>
          </TouchableOpacity>
          {userStensylScore && (
            <Text style={styles.userStats}>Score {userStensylScore}</Text>
          )}
          {userStreak && (
            <Text style={styles.userStats}>{userStreak}-day streak</Text>
          )}
          <Text style={styles.timestamp}>{formatTime(timestamp)}</Text>
        </View>

        {/* Reactions */}
        <View style={styles.reactions}>
          <TouchableOpacity
            style={styles.reactionButton}
            onPress={() => handleReaction('fire')}
            disabled={isReacting}
          >
            <Text style={styles.reactionEmoji}>🔥</Text>
            <Text style={styles.reactionCount}>{fireCount}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reactionButton}
            onPress={() => handleReaction('clap')}
            disabled={isReacting}
          >
            <Text style={styles.reactionEmoji}>👏</Text>
            <Text style={styles.reactionCount}>{clapCount}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 8,
    lineHeight: 24,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  duration: {
    fontSize: 16,
    fontWeight: '600',
    color: stensylColors.primaryAccent,
  },
  separator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: stensylColors.textMuted,
    marginHorizontal: 8,
  },
  subject: {
    fontSize: 14,
    color: stensylColors.textWhite,
    fontWeight: '500',
  },
  efficiencyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  efficiency: {
    fontSize: 14,
    fontWeight: '500',
  },
  notes: {
    fontSize: 14,
    color: stensylColors.textMuted,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    // Add slight padding for better touch target
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: stensylColors.primaryAccent,
    marginBottom: 2,
  },
  userStats: {
    fontSize: 12,
    color: stensylColors.textMuted,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: stensylColors.textMuted,
    marginTop: 4,
  },
  reactions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    minWidth: 50,
    justifyContent: 'center',
  },
  reactionEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 14,
    fontWeight: '500',
    color: stensylColors.textWhite,
  },
}); 