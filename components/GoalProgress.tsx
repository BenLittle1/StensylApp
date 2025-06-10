import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface Goal {
  id: string;
  goal_type: 'daily_minutes' | 'weekly_sessions' | 'daily_sessions' | 'weekly_minutes';
  target_value: number;
  created_at: string;
}

interface ProgressData {
  total_minutes: number;
  total_sessions: number;
}

interface GoalProgressProps {
  onSetGoalPress?: () => void;
  compact?: boolean;
}

const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
};

const CircularProgress: React.FC<{
  progress: number;
  size: number;
  strokeWidth: number;
  color: string;
  backgroundColor?: string;
}> = ({ progress, size, strokeWidth, color, backgroundColor = '#2a2a2a' }) => {
  const radius = (size - strokeWidth) / 2;
  const centerX = size / 2;
  const centerY = size / 2;

  // Simple circular progress using just View and borders
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: backgroundColor,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
    }}>
      {/* Progress indicator */}
      <View
        style={{
          position: 'absolute',
          width: size - strokeWidth,
          height: size - strokeWidth,
          borderRadius: (size - strokeWidth) / 2,
          borderWidth: strokeWidth / 2,
          borderColor: color,
          borderTopColor: progress > 0.75 ? color : backgroundColor,
          borderRightColor: progress > 0.5 ? color : backgroundColor,
          borderBottomColor: progress > 0.25 ? color : backgroundColor,
          borderLeftColor: progress > 0 ? color : backgroundColor,
          transform: [{ rotate: `${progress * 360}deg` }],
        }}
      />
      
      <Text style={{ 
        fontSize: 16, 
        fontWeight: 'bold', 
        color: stensylColors.textWhite,
        position: 'relative',
        zIndex: 1,
      }}>
        {Math.round(progress * 100)}%
      </Text>
    </View>
  );
};

const GoalCard: React.FC<{
  goal: Goal;
  progress: ProgressData;
  compact?: boolean;
}> = ({ goal, progress, compact = false }) => {
  const goalConfig = {
    daily_minutes: {
      title: 'Daily Time Goal',
      icon: 'schedule' as const,
      getCurrentValue: () => progress.total_minutes,
      formatValue: (value: number) => formatTime(value),
      formatTarget: (value: number) => formatTime(value),
    },
    weekly_sessions: {
      title: 'Weekly Sessions Goal',
      icon: 'event-repeat' as const,
      getCurrentValue: () => progress.total_sessions,
      formatValue: (value: number) => `${value} sessions`,
      formatTarget: (value: number) => `${value} sessions`,
    },
    daily_sessions: {
      title: 'Daily Sessions Goal',
      icon: 'today' as const,
      getCurrentValue: () => progress.total_sessions,
      formatValue: (value: number) => `${value} sessions`,
      formatTarget: (value: number) => `${value} sessions`,
    },
    weekly_minutes: {
      title: 'Weekly Time Goal',
      icon: 'date-range' as const,
      getCurrentValue: () => progress.total_minutes,
      formatValue: (value: number) => formatTime(value),
      formatTarget: (value: number) => formatTime(value),
    },
  };

  const config = goalConfig[goal.goal_type];
  const currentValue = config.getCurrentValue();
  const progressPercentage = Math.min(currentValue / goal.target_value, 1);
  const isCompleted = currentValue >= goal.target_value;

  const progressColor = isCompleted 
    ? '#10B981' // Green
    : progressPercentage >= 0.8 
    ? stensylColors.primaryAccent 
    : progressPercentage >= 0.5 
    ? '#F59E0B' // Yellow
    : '#EF4444'; // Red

  if (compact) {
    return (
      <View style={styles.compactGoalCard}>
        <View style={styles.compactGoalHeader}>
          <MaterialIcons name={config.icon} size={20} color={progressColor} />
          <Text style={styles.compactGoalTitle}>{config.title}</Text>
          {isCompleted && (
            <MaterialIcons name="check-circle" size={16} color="#10B981" />
          )}
        </View>
        <View style={styles.compactProgressContainer}>
          <View style={styles.compactProgressBar}>
            <View 
              style={[
                styles.compactProgressFill, 
                { width: `${progressPercentage * 100}%`, backgroundColor: progressColor }
              ]} 
            />
          </View>
          <Text style={styles.compactProgressText}>
            {config.formatValue(currentValue)} / {config.formatTarget(goal.target_value)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.goalCard}>
      <View style={styles.goalHeader}>
        <View style={styles.goalTitleContainer}>
          <MaterialIcons name={config.icon} size={24} color={progressColor} />
          <Text style={styles.goalTitle}>{config.title}</Text>
        </View>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <MaterialIcons name="check-circle" size={16} color="#10B981" />
            <Text style={styles.completedText}>Complete!</Text>
          </View>
        )}
      </View>

      <View style={styles.goalContent}>
        <CircularProgress
          progress={progressPercentage}
          size={80}
          strokeWidth={6}
          color={progressColor}
        />
        <View style={styles.goalStats}>
          <Text style={styles.goalValue}>
            {config.formatValue(currentValue)}
          </Text>
          <Text style={styles.goalTarget}>
            of {config.formatTarget(goal.target_value)}
          </Text>
          <Text style={styles.goalTimeframe}>
            {goal.goal_type.includes('daily') ? 'Today' : 'This Week'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export const GoalProgress: React.FC<GoalProgressProps> = ({ 
  onSetGoalPress, 
  compact = false 
}) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dailyProgress, setDailyProgress] = useState<ProgressData>({ total_minutes: 0, total_sessions: 0 });
  const [weeklyProgress, setWeeklyProgress] = useState<ProgressData>({ total_minutes: 0, total_sessions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchGoalsAndProgress = async () => {
      try {
        // Fetch user goals
        const { data: goalsData, error: goalsError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (goalsError) throw goalsError;

        // Fetch daily progress
        const { data: dailyData, error: dailyError } = await supabase
          .rpc('get_daily_progress', { user_uuid: user.id });

        if (dailyError) throw dailyError;

        // Fetch weekly progress
        const { data: weeklyData, error: weeklyError } = await supabase
          .rpc('get_weekly_progress', { user_uuid: user.id });

        if (weeklyError) throw weeklyError;

        setGoals(goalsData || []);
        setDailyProgress(dailyData?.[0] || { total_minutes: 0, total_sessions: 0 });
        setWeeklyProgress(weeklyData?.[0] || { total_minutes: 0, total_sessions: 0 });
      } catch (error) {
        console.error('Error fetching goals and progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGoalsAndProgress();
  }, [user]);

  const displayGoals = useMemo(() => {
    return goals.map(goal => ({
      ...goal,
      progress: goal.goal_type.includes('daily') ? dailyProgress : weeklyProgress,
    }));
  }, [goals, dailyProgress, weeklyProgress]);

  if (loading) {
    return (
      <View style={compact ? styles.compactLoadingContainer : styles.loadingContainer}>
        <ActivityIndicator size="small" color={stensylColors.primaryAccent} />
        <Text style={styles.loadingText}>Loading goals...</Text>
      </View>
    );
  }

  if (displayGoals.length === 0) {
    return (
      <View style={compact ? styles.compactEmptyContainer : styles.emptyContainer}>
        <MaterialIcons name="flag" size={compact ? 24 : 32} color={stensylColors.textMuted} />
        <Text style={compact ? styles.compactEmptyTitle : styles.emptyTitle}>
          No Goals Set
        </Text>
        <Text style={compact ? styles.compactEmptyText : styles.emptyText}>
          Set your first study goal to track progress!
        </Text>
        {onSetGoalPress && (
          <TouchableOpacity 
            style={compact ? styles.compactSetGoalButton : styles.setGoalButton} 
            onPress={onSetGoalPress}
          >
            <Text style={styles.setGoalButtonText}>Set Goal</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <View style={compact ? styles.compactContainer : styles.container}>
      {displayGoals.map((goal) => (
        <GoalCard 
          key={goal.id} 
          goal={goal} 
          progress={goal.progress}
          compact={compact}
        />
      ))}
      
      {!compact && onSetGoalPress && (
        <TouchableOpacity style={styles.addGoalButton} onPress={onSetGoalPress}>
          <MaterialIcons name="add" size={24} color={stensylColors.primaryAccent} />
          <Text style={styles.addGoalText}>Add Another Goal</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  compactContainer: {
    padding: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  compactLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  loadingText: {
    marginLeft: 8,
    color: stensylColors.textMuted,
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    margin: 16,
  },
  compactEmptyContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginTop: 12,
    marginBottom: 8,
  },
  compactEmptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginTop: 8,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: stensylColors.textMuted,
    textAlign: 'center',
    marginBottom: 16,
  },
  compactEmptyText: {
    fontSize: 12,
    color: stensylColors.textMuted,
    textAlign: 'center',
    marginBottom: 12,
  },
  setGoalButton: {
    backgroundColor: stensylColors.primaryAccent,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  compactSetGoalButton: {
    backgroundColor: stensylColors.primaryAccent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  setGoalButtonText: {
    color: stensylColors.textWhite,
    fontWeight: '600',
    fontSize: 14,
  },
  goalCard: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: stensylColors.inputBackground,
  },
  compactGoalCard: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: stensylColors.inputBackground,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  compactGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginLeft: 8,
  },
  compactGoalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginLeft: 6,
    flex: 1,
  },
  completedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B98115',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completedText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  goalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  goalStats: {
    marginLeft: 20,
    flex: 1,
  },
  goalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 4,
  },
  goalTarget: {
    fontSize: 14,
    color: stensylColors.textMuted,
    marginBottom: 2,
  },
  goalTimeframe: {
    fontSize: 12,
    color: stensylColors.textMuted,
    fontStyle: 'italic',
  },
  compactProgressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  compactProgressBar: {
    flex: 1,
    height: 4,
    backgroundColor: stensylColors.inputBackground,
    borderRadius: 2,
    marginRight: 12,
  },
  compactProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  compactProgressText: {
    fontSize: 12,
    color: stensylColors.textMuted,
    minWidth: 80,
    textAlign: 'right',
  },
  addGoalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: stensylColors.inputBackground,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: stensylColors.primaryAccent,
    borderStyle: 'dashed',
    marginTop: 8,
  },
  addGoalText: {
    marginLeft: 8,
    color: stensylColors.primaryAccent,
    fontWeight: '600',
    fontSize: 14,
  },
}); 