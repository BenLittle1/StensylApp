import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';
import { calculatePerformanceIndex, Session } from '@/lib/performanceIndex';

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

interface PerformanceIndexProps {
  posts: Post[];
  compact?: boolean;
  showLeaderboard?: boolean;
}

// Helper to parse HH:MM:SS duration to minutes
const parseDurationToMinutes = (duration: string): number => {
  const parts = duration.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 60 + parts[1] + parts[2] / 60;
  }
  if (parts.length === 2) {
    return parts[0] + parts[1] / 60;
  }
  return 0;
};

const getScoreColor = (score: number): string => {
  if (score >= 80) return '#10B981'; // Green - Excellent
  if (score >= 60) return stensylColors.primaryAccent; // Blue - Good
  if (score >= 40) return '#F59E0B'; // Yellow - Fair
  return '#EF4444'; // Red - Needs Work
};

const getScoreGrade = (score: number): string => {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 50) return 'D';
  return 'F';
};

const getScoreMessage = (score: number): string => {
  if (score >= 80) return 'Excellent study discipline! 🏆';
  if (score >= 60) return 'Great progress! Keep it up! 📈';
  if (score >= 40) return 'Good foundation. Room to grow! 🌱';
  if (score >= 20) return 'Building habits. Stay consistent! 💪';
  return 'Just getting started. Every session counts! 🌟';
};

const ScoreBreakdown: React.FC<{ 
  score: number;
  sessions: Session[];
  visible: boolean; 
  onClose: () => void; 
}> = ({ score, sessions, visible, onClose }) => {
  const components = [
    {
      name: 'Consistency',
      description: 'Study days and streaks in the last 7 days',
      icon: 'event-repeat' as const,
      color: '#8B5CF6',
      maxPoints: 40,
    },
    {
      name: 'Goal Achievement',
      description: 'Daily and weekly goals completion',
      icon: 'flag' as const,
      color: '#10B981',
      maxPoints: 30,
    },
    {
      name: 'Study Volume',
      description: 'Time invested (rewards consistency over cramming)',
      icon: 'schedule' as const,
      color: '#F59E0B',
      maxPoints: 20,
    },
    {
      name: 'Focus Quality',
      description: 'Efficiency ratings and session patterns',
      icon: 'center-focus-strong' as const,
      color: '#EF4444',
      maxPoints: 10,
    },
  ];

  const uniqueStudyDays = new Set(
    sessions.map(s => new Date(s.date).toDateString())
  ).size;

  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const avgEfficiency = sessions.filter(s => s.efficiency).length > 0 
    ? sessions.filter(s => s.efficiency).reduce((sum, s) => sum + (s.efficiency || 0), 0) / sessions.filter(s => s.efficiency).length
    : 0;

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.breakdownModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Performance Index Breakdown</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={stensylColors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.breakdownContent}>
            <View style={styles.totalScoreSection}>
              <Text style={[styles.totalScore, { color: getScoreColor(score) }]}>{score}</Text>
              <Text style={styles.totalScoreLabel}>Performance Index</Text>
              <Text style={[styles.totalScoreGrade, { color: getScoreColor(score) }]}>{getScoreGrade(score)}</Text>
            </View>

            <Text style={styles.explanationText}>
              Your Performance Index measures study discipline, consistency, and focus. 
              It rewards regular study habits over cramming and considers goal completion and efficiency.
            </Text>

            {components.map((component) => (
              <View key={component.name} style={styles.componentCard}>
                <View style={styles.componentHeader}>
                  <MaterialIcons 
                    name={component.icon} 
                    size={24} 
                    color={component.color} 
                  />
                  <View style={styles.componentInfo}>
                    <Text style={styles.componentName}>{component.name}</Text>
                    <Text style={styles.componentDescription}>{component.description}</Text>
                  </View>
                  <Text style={styles.componentScore}>
                    {component.maxPoints} pts max
                  </Text>
                </View>
              </View>
            ))}

            <View style={styles.sessionInfoSection}>
              <Text style={styles.sessionInfoTitle}>Recent Activity</Text>
              <View style={styles.sessionStats}>
                <View style={styles.sessionStat}>
                  <MaterialIcons name="timer" size={20} color={stensylColors.textMuted} />
                  <Text style={styles.sessionStatText}>
                    {Math.round(totalMinutes)} total minutes this week
                  </Text>
                </View>
                <View style={styles.sessionStat}>
                  <MaterialIcons name="play-circle-outline" size={20} color={stensylColors.textMuted} />
                  <Text style={styles.sessionStatText}>
                    {sessions.length} session{sessions.length !== 1 ? 's' : ''} logged
                  </Text>
                </View>
                <View style={styles.sessionStat}>
                  <MaterialIcons name="calendar-today" size={20} color={stensylColors.textMuted} />
                  <Text style={styles.sessionStatText}>
                    {uniqueStudyDays} unique study day{uniqueStudyDays !== 1 ? 's' : ''}
                  </Text>
                </View>
                {avgEfficiency > 0 && (
                  <View style={styles.sessionStat}>
                    <MaterialIcons name="trending-up" size={20} color={stensylColors.textMuted} />
                    <Text style={styles.sessionStatText}>
                      {avgEfficiency.toFixed(1)}/10 average efficiency
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.improvementTips}>
              <Text style={styles.sessionInfoTitle}>How to Improve</Text>
              <View style={styles.tipsList}>
                <Text style={styles.tipItem}>• Study consistently across multiple days</Text>
                <Text style={styles.tipItem}>• Set and complete daily goals</Text>
                <Text style={styles.tipItem}>• Rate your session efficiency (1-10)</Text>
                <Text style={styles.tipItem}>• Aim for 10+ hours per week total</Text>
                <Text style={styles.tipItem}>• Maintain focus during longer sessions</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export const PerformanceIndex: React.FC<PerformanceIndexProps> = ({ 
  posts,
  compact = false, 
  showLeaderboard = false 
}) => {
  const [breakdownVisible, setBreakdownVisible] = useState(false);

  const { score, sessions } = useMemo(() => {
    // Convert posts to sessions for our calculation
    const sessions: Session[] = posts.map(post => ({
      date: post.created_at,
      duration: parseDurationToMinutes(post.duration),
      goalCompleted: undefined, // We don't have goal completion data in posts yet
      efficiency: post.efficiency || undefined,
    }));

    // Calculate the score using our tested function
    const score = calculatePerformanceIndex({
      sessions,
      dailyGoalCount: 1, // Assume 1 daily goal for now (we can make this dynamic later)
      weeklyGoalCount: 0,
    });

    return { score, sessions };
  }, [posts]);

  const scoreColor = useMemo(() => {
    return getScoreColor(score);
  }, [score]);

  if (posts.length === 0) {
    return (
      <View style={compact ? styles.compactEmptyContainer : styles.emptyContainer}>
        <MaterialIcons name="analytics" size={compact ? 24 : 32} color={stensylColors.textMuted} />
        <Text style={compact ? styles.compactEmptyTitle : styles.emptyTitle}>
          No Index Yet
        </Text>
        <Text style={compact ? styles.compactEmptyText : styles.emptyText}>
          Complete a study session to see your Performance Index!
        </Text>
      </View>
    );
  }

  if (compact) {
    return (
      <TouchableOpacity 
        style={styles.compactScoreCard} 
        onPress={() => setBreakdownVisible(true)}
      >
        <View style={styles.compactScoreHeader}>
          <Text style={styles.compactScoreLabel}>Performance Index</Text>
          <MaterialIcons name="info-outline" size={16} color={stensylColors.textMuted} />
        </View>
        <View style={styles.compactScoreContent}>
          <Text style={[styles.compactScoreValue, { color: scoreColor }]}>
            {score}
          </Text>
          <Text style={[styles.compactScoreGrade, { color: scoreColor }]}>
            {getScoreGrade(score)}
          </Text>
        </View>

        <ScoreBreakdown 
          score={score}
          sessions={sessions}
          visible={breakdownVisible}
          onClose={() => setBreakdownVisible(false)}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.fullScoreCard}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreTitle}>Your Performance Index</Text>
        {showLeaderboard && (
          <TouchableOpacity style={styles.leaderboardButton}>
            <MaterialIcons name="leaderboard" size={20} color={stensylColors.primaryAccent} />
            <Text style={styles.leaderboardButtonText}>Rankings</Text>
          </TouchableOpacity>
        )}
      </View>

      <TouchableOpacity 
        style={styles.scoreDisplay}
        onPress={() => setBreakdownVisible(true)}
      >
        <Text style={[styles.scoreValue, { color: scoreColor }]}>
          {score}
        </Text>
        <Text style={[styles.scoreGrade, { color: scoreColor }]}>
          {getScoreGrade(score)}
        </Text>
      </TouchableOpacity>

      <Text style={styles.scoreMessage}>
        {getScoreMessage(score)}
      </Text>

      <TouchableOpacity 
        style={styles.viewBreakdownButton}
        onPress={() => setBreakdownVisible(true)}
      >
        <Text style={styles.viewBreakdownText}>View Index Breakdown</Text>
        <MaterialIcons name="chevron-right" size={20} color={stensylColors.primaryAccent} />
      </TouchableOpacity>

      <ScoreBreakdown 
        score={score}
        sessions={sessions}
        visible={breakdownVisible}
        onClose={() => setBreakdownVisible(false)}
      />
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
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
  },
  compactEmptyText: {
    fontSize: 12,
    color: stensylColors.textMuted,
    textAlign: 'center',
  },
  compactScoreCard: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: stensylColors.inputBackground,
  },
  compactScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactScoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: stensylColors.textWhite,
  },
  compactScoreContent: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  compactScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  compactScoreGrade: {
    fontSize: 16,
    fontWeight: '600',
  },
  fullScoreCard: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: stensylColors.inputBackground,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: stensylColors.textWhite,
  },
  leaderboardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: stensylColors.inputBackground,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  leaderboardButtonText: {
    marginLeft: 4,
    color: stensylColors.primaryAccent,
    fontSize: 12,
    fontWeight: '600',
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  scoreGrade: {
    fontSize: 24,
    fontWeight: '600',
  },
  scoreMessage: {
    fontSize: 16,
    color: stensylColors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
  },
  viewBreakdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: stensylColors.inputBackground,
    padding: 12,
    borderRadius: 8,
  },
  viewBreakdownText: {
    color: stensylColors.primaryAccent,
    fontWeight: '600',
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakdownModal: {
    width: screenWidth * 0.9,
    maxHeight: '85%',
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: stensylColors.inputBackground,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
  },
  closeButton: {
    padding: 4,
  },
  breakdownContent: {
    padding: 20,
  },
  totalScoreSection: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 20,
    backgroundColor: stensylColors.inputBackground,
    borderRadius: 12,
  },
  totalScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 4,
  },
  totalScoreLabel: {
    fontSize: 16,
    color: stensylColors.textMuted,
    marginBottom: 8,
  },
  totalScoreGrade: {
    fontSize: 24,
    fontWeight: '600',
    color: stensylColors.primaryAccent,
  },
  explanationText: {
    fontSize: 14,
    color: stensylColors.textMuted,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  componentCard: {
    backgroundColor: stensylColors.inputBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  componentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  componentName: {
    fontSize: 16,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 2,
  },
  componentDescription: {
    fontSize: 12,
    color: stensylColors.textMuted,
  },
  componentScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: stensylColors.textMuted,
  },
  sessionInfoSection: {
    marginTop: 20,
  },
  sessionInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 12,
  },
  sessionStats: {
    gap: 8,
  },
  sessionStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionStatText: {
    fontSize: 14,
    color: stensylColors.textMuted,
  },
  improvementTips: {
    marginTop: 20,
  },
  tipsList: {
    marginLeft: 20,
  },
  tipItem: {
    fontSize: 14,
    color: stensylColors.textMuted,
    marginBottom: 4,
  },
}); 