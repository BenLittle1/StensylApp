import React, { useState, useEffect, useMemo } from 'react';
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
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

interface StensylScoreData {
  score_value: number;
  consistency_points: number;
  goal_achievement_points: number;
  study_volume_points: number;
  focus_quality_points: number;
  sessions_count: number;
  total_minutes: number;
  score_date: string;
}

interface LeaderboardEntry {
  score_value: number;
  score_date: string;
  anonymous_id: string;
}

interface StensylScoreProps {
  compact?: boolean;
  showLeaderboard?: boolean;
}

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
  return 'Let\'s build that study habit! 💪';
};

const ScoreBreakdown: React.FC<{ 
  data: StensylScoreData; 
  visible: boolean; 
  onClose: () => void; 
}> = ({ data, visible, onClose }) => {
  const components = [
    {
      name: 'Consistency',
      points: data.consistency_points,
      maxPoints: 40,
      icon: 'streak' as const,
      description: 'Study days and streaks',
      color: '#8B5CF6',
    },
    {
      name: 'Goal Achievement',
      points: data.goal_achievement_points,
      maxPoints: 30,
      icon: 'flag' as const,
      description: 'Daily and weekly goals met',
      color: '#10B981',
    },
    {
      name: 'Study Volume',
      points: data.study_volume_points,
      maxPoints: 20,
      icon: 'schedule' as const,
      description: 'Time invested (anti-cramming)',
      color: '#F59E0B',
    },
    {
      name: 'Focus Quality',
      points: data.focus_quality_points,
      maxPoints: 10,
      icon: 'center-focus-strong' as const,
      description: 'Efficiency and session patterns',
      color: '#EF4444',
    },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.breakdownModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Score Breakdown</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={stensylColors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.breakdownContent}>
            <View style={styles.totalScoreSection}>
              <Text style={styles.totalScore}>{data.score_value}</Text>
              <Text style={styles.totalScoreLabel}>Stensyl Score</Text>
              <Text style={styles.totalScoreGrade}>{getScoreGrade(data.score_value)}</Text>
            </View>

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
                    {Math.round(component.points)}/{component.maxPoints}
                  </Text>
                </View>
                
                <View style={styles.componentProgress}>
                  <View style={styles.componentProgressBg}>
                    <View 
                      style={[
                        styles.componentProgressFill,
                        { 
                          width: `${(component.points / component.maxPoints) * 100}%`,
                          backgroundColor: component.color 
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>
            ))}

            <View style={styles.sessionInfo}>
              <Text style={styles.sessionInfoTitle}>Today's Activity</Text>
              <View style={styles.sessionStats}>
                <View style={styles.sessionStat}>
                  <MaterialIcons name="timer" size={20} color={stensylColors.textMuted} />
                  <Text style={styles.sessionStatText}>
                    {Math.floor(data.total_minutes / 60)}h {data.total_minutes % 60}m studied
                  </Text>
                </View>
                <View style={styles.sessionStat}>
                  <MaterialIcons name="play-circle-outline" size={20} color={stensylColors.textMuted} />
                  <Text style={styles.sessionStatText}>
                    {data.sessions_count} session{data.sessions_count !== 1 ? 's' : ''}
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const LeaderboardModal: React.FC<{ 
  visible: boolean; 
  onClose: () => void; 
}> = ({ visible, onClose }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (visible) {
      fetchLeaderboard();
    }
  }, [visible]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .rpc('get_leaderboard', { score_period: 'daily', limit_count: 10 });

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.leaderboardModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Leaderboard</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={stensylColors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.leaderboardContent}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={stensylColors.primaryAccent} />
                <Text style={styles.loadingText}>Loading rankings...</Text>
              </View>
            ) : (
              leaderboard.map((entry, index) => (
                <View key={`${entry.anonymous_id}-${index}`} style={styles.leaderboardEntry}>
                  <View style={styles.leaderboardRank}>
                    <Text style={styles.rankNumber}>#{index + 1}</Text>
                    {index < 3 && (
                      <MaterialIcons 
                        name={index === 0 ? 'emoji-events' : 'emoji-events'} 
                        size={20} 
                        color={index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32'} 
                      />
                    )}
                  </View>
                  <Text style={styles.leaderboardName}>{entry.anonymous_id}</Text>
                  <View style={styles.leaderboardScore}>
                    <Text style={[styles.leaderboardScoreText, { color: getScoreColor(entry.score_value) }]}>
                      {entry.score_value}
                    </Text>
                    <Text style={styles.leaderboardGrade}>{getScoreGrade(entry.score_value)}</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export const StensylScore: React.FC<StensylScoreProps> = ({ 
  compact = false, 
  showLeaderboard = false 
}) => {
  const { user } = useAuth();
  const [scoreData, setScoreData] = useState<StensylScoreData | null>(null);
  const [loading, setLoading] = useState(true);
  const [breakdownVisible, setBreakdownVisible] = useState(false);
  const [leaderboardVisible, setLeaderboardVisible] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchScore = async () => {
      try {
        const { data, error } = await supabase
          .rpc('get_user_stensyl_score', { user_uuid: user.id });

        if (error) throw error;
        setScoreData(data?.[0] || null);
      } catch (error) {
        console.error('Error fetching Stensyl Score:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScore();
  }, [user]);

  const scoreColor = useMemo(() => {
    return scoreData ? getScoreColor(scoreData.score_value) : stensylColors.textMuted;
  }, [scoreData]);

  if (loading) {
    return (
      <View style={compact ? styles.compactLoadingContainer : styles.loadingContainer}>
        <ActivityIndicator size="small" color={stensylColors.primaryAccent} />
        <Text style={styles.loadingText}>Calculating score...</Text>
      </View>
    );
  }

  if (!scoreData) {
    return (
      <View style={compact ? styles.compactEmptyContainer : styles.emptyContainer}>
        <MaterialIcons name="quiz" size={compact ? 24 : 32} color={stensylColors.textMuted} />
        <Text style={compact ? styles.compactEmptyTitle : styles.emptyTitle}>
          No Score Yet
        </Text>
        <Text style={compact ? styles.compactEmptyText : styles.emptyText}>
          Complete a study session to see your Stensyl Score!
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
          <Text style={styles.compactScoreLabel}>Stensyl Score</Text>
          <MaterialIcons name="info-outline" size={16} color={stensylColors.textMuted} />
        </View>
        <View style={styles.compactScoreContent}>
          <Text style={[styles.compactScoreValue, { color: scoreColor }]}>
            {scoreData.score_value}
          </Text>
          <Text style={[styles.compactScoreGrade, { color: scoreColor }]}>
            {getScoreGrade(scoreData.score_value)}
          </Text>
        </View>
        
        {scoreData && (
          <ScoreBreakdown 
            data={scoreData}
            visible={breakdownVisible}
            onClose={() => setBreakdownVisible(false)}
          />
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.fullScoreCard}>
      <View style={styles.scoreHeader}>
        <Text style={styles.scoreTitle}>Your Stensyl Score</Text>
        {showLeaderboard && (
          <TouchableOpacity 
            style={styles.leaderboardButton}
            onPress={() => setLeaderboardVisible(true)}
          >
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
          {scoreData.score_value}
        </Text>
        <Text style={[styles.scoreGrade, { color: scoreColor }]}>
          {getScoreGrade(scoreData.score_value)}
        </Text>
      </TouchableOpacity>

      <Text style={styles.scoreMessage}>
        {getScoreMessage(scoreData.score_value)}
      </Text>

      <TouchableOpacity 
        style={styles.viewBreakdownButton}
        onPress={() => setBreakdownVisible(true)}
      >
        <Text style={styles.viewBreakdownText}>View Score Breakdown</Text>
        <MaterialIcons name="chevron-right" size={20} color={stensylColors.primaryAccent} />
      </TouchableOpacity>

      {scoreData && (
        <>
          <ScoreBreakdown 
            data={scoreData}
            visible={breakdownVisible}
            onClose={() => setBreakdownVisible(false)}
          />
          <LeaderboardModal
            visible={leaderboardVisible}
            onClose={() => setLeaderboardVisible(false)}
          />
        </>
      )}
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
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
  leaderboardModal: {
    width: screenWidth * 0.9,
    maxHeight: '75%',
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
  leaderboardContent: {
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
  componentCard: {
    backgroundColor: stensylColors.inputBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
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
    fontSize: 16,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
  },
  componentProgress: {
    marginTop: 8,
  },
  componentProgressBg: {
    height: 6,
    backgroundColor: stensylColors.background,
    borderRadius: 3,
    overflow: 'hidden',
  },
  componentProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  sessionInfo: {
    marginTop: 20,
    padding: 16,
    backgroundColor: stensylColors.inputBackground,
    borderRadius: 8,
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
  },
  sessionStatText: {
    marginLeft: 8,
    fontSize: 14,
    color: stensylColors.textMuted,
  },
  leaderboardEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: stensylColors.inputBackground,
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  leaderboardRank: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 60,
  },
  rankNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginRight: 8,
  },
  leaderboardName: {
    flex: 1,
    fontSize: 16,
    color: stensylColors.textWhite,
    marginLeft: 12,
  },
  leaderboardScore: {
    alignItems: 'flex-end',
  },
  leaderboardScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  leaderboardGrade: {
    fontSize: 14,
    fontWeight: '600',
    color: stensylColors.textMuted,
  },
});