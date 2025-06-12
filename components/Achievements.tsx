import React, { useMemo } from 'react';
import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';

interface Post {
  id: string;
  created_at: string;
  duration: string;
  subject: string;
  efficiency: number | null;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  color: string;
  isUnlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementsProps {
  posts: Post[];
  compact?: boolean;
}

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

const calculateAchievements = (posts: Post[]): Achievement[] => {
  const totalMinutes = posts.reduce((acc, post) => acc + parseDuration(post.duration) / 60, 0);
  const totalSessions = posts.length;
  const today = new Date().toDateString();
  const todaySessions = posts.filter(post => new Date(post.created_at).toDateString() === today).length;
  
  // Calculate study streak
  const uniqueDates = [...new Set(posts.map(post => new Date(post.created_at).toDateString()))].sort();
  let streak = 0;
  const todayStr = new Date().toDateString();
  let checkDate = new Date();
  
  while (uniqueDates.includes(checkDate.toDateString())) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  const subjects = [...new Set(posts.map(post => post.subject))];
  const highEfficiencyCount = posts.filter(post => (post.efficiency || 0) >= 8).length;

  return [
    {
      id: 'first_session',
      title: 'First Step',
      description: 'Complete your first study session',
      icon: 'play-arrow',
      color: '#10B981',
      isUnlocked: totalSessions >= 1,
    },
    {
      id: 'early_bird',
      title: 'Early Bird',
      description: 'Study 3 sessions in one day',
      icon: 'wb-sunny',
      color: '#F59E0B',
      isUnlocked: todaySessions >= 3,
      progress: Math.min(todaySessions, 3),
      maxProgress: 3,
    },
    {
      id: 'streak_master',
      title: 'Streak Master',
      description: 'Study for 7 days in a row',
      icon: 'local-fire-department',
      color: '#EF4444',
      isUnlocked: streak >= 7,
      progress: Math.min(streak, 7),
      maxProgress: 7,
    },
    {
      id: 'study_warrior',
      title: 'Study Warrior',
      description: 'Complete 50 study sessions',
      icon: 'military-tech',
      color: '#8B5CF6',
      isUnlocked: totalSessions >= 50,
      progress: Math.min(totalSessions, 50),
      maxProgress: 50,
    },
    {
      id: 'time_master',
      title: 'Time Master',
      description: 'Study for 100 hours total',
      icon: 'schedule',
      color: '#06B6D4',
      isUnlocked: totalMinutes >= 6000, // 100 hours
      progress: Math.min(totalMinutes, 6000),
      maxProgress: 6000,
    },
    {
      id: 'multi_subject',
      title: 'Renaissance Scholar',
      description: 'Study 5 different subjects',
      icon: 'school',
      color: '#84CC16',
      isUnlocked: subjects.length >= 5,
      progress: Math.min(subjects.length, 5),
      maxProgress: 5,
    },
    {
      id: 'efficiency_expert',
      title: 'Efficiency Expert',
      description: 'Score 8+ efficiency in 10 sessions',
      icon: 'trending-up',
      color: '#3B82F6',
      isUnlocked: highEfficiencyCount >= 10,
      progress: Math.min(highEfficiencyCount, 10),
      maxProgress: 10,
    },
    {
      id: 'dedicated',
      title: 'Dedicated Learner',
      description: 'Study for 30 days in a row',
      icon: 'event-available',
      color: '#EC4899',
      isUnlocked: streak >= 30,
      progress: Math.min(streak, 30),
      maxProgress: 30,
    },
  ];
};

const AchievementCard: React.FC<{
  achievement: Achievement;
  compact?: boolean;
}> = ({ achievement, compact = false }) => {
  if (compact) {
    return (
      <View style={[
        styles.compactCard,
        achievement.isUnlocked ? styles.compactCardUnlocked : styles.compactCardLocked
      ]}>
        <View style={[
          styles.compactIconContainer,
          { backgroundColor: achievement.isUnlocked ? achievement.color + '20' : '#374151' }
        ]}>
          <MaterialIcons 
            name={achievement.icon} 
            size={20} 
            color={achievement.isUnlocked ? achievement.color : '#6B7280'} 
          />
        </View>
        <Text style={[
          styles.compactTitle,
          achievement.isUnlocked ? styles.compactTitleUnlocked : styles.compactTitleLocked
        ]}>
          {achievement.title}
        </Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.achievementCard,
      achievement.isUnlocked ? styles.achievementCardUnlocked : styles.achievementCardLocked
    ]}>
      <View style={styles.achievementHeader}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: achievement.isUnlocked ? achievement.color + '20' : '#374151' }
        ]}>
          <MaterialIcons 
            name={achievement.icon} 
            size={24} 
            color={achievement.isUnlocked ? achievement.color : '#6B7280'} 
          />
        </View>
        <View style={styles.achievementContent}>
          <Text style={[
            styles.achievementTitle,
            achievement.isUnlocked ? styles.achievementTitleUnlocked : styles.achievementTitleLocked
          ]}>
            {achievement.title}
          </Text>
          <Text style={styles.achievementDescription}>
            {achievement.description}
          </Text>
        </View>
        {achievement.isUnlocked && (
          <MaterialIcons name="check-circle" size={20} color={achievement.color} />
        )}
      </View>
      
      {achievement.maxProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${(achievement.progress! / achievement.maxProgress) * 100}%`,
                  backgroundColor: achievement.isUnlocked ? achievement.color : '#6B7280'
                }
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            {achievement.progress} / {achievement.maxProgress}
          </Text>
        </View>
      )}
    </View>
  );
};

export const Achievements: React.FC<AchievementsProps> = ({ posts, compact = false }) => {
  const achievements = useMemo(() => calculateAchievements(posts), [posts]);
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;

  if (compact) {
    const recentAchievements = achievements.filter(a => a.isUnlocked).slice(-3);
    
    if (recentAchievements.length === 0) {
      return (
        <View style={styles.compactContainer}>
          <Text style={styles.compactSectionTitle}>Achievements ({unlockedCount}/{achievements.length})</Text>
          <Text style={styles.compactEmptyText}>Start studying to unlock achievements!</Text>
        </View>
      );
    }

    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactSectionTitle}>
          Recent Achievements ({unlockedCount}/{achievements.length})
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.compactScrollContent}
        >
          {recentAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              compact={true}
            />
          ))}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Achievements ({unlockedCount}/{achievements.length})
      </Text>
      <ScrollView style={styles.achievementsContainer}>
        {achievements.map((achievement) => (
          <AchievementCard
            key={achievement.id}
            achievement={achievement}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  compactContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: stensylColors.textWhite,
    marginBottom: 20,
  },
  compactSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 12,
  },
  compactEmptyText: {
    fontSize: 14,
    color: stensylColors.textMuted,
    fontStyle: 'italic',
  },
  achievementsContainer: {
    maxHeight: 500,
  },
  compactScrollContent: {
    paddingRight: 16,
  },
  achievementCard: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  achievementCardUnlocked: {
    borderColor: stensylColors.primaryAccent + '40',
  },
  achievementCardLocked: {
    borderColor: stensylColors.inputBackground,
    opacity: 0.7,
  },
  compactCard: {
    alignItems: 'center',
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 10,
    padding: 12,
    marginRight: 12,
    width: 100,
    borderWidth: 1,
  },
  compactCardUnlocked: {
    borderColor: stensylColors.primaryAccent + '40',
  },
  compactCardLocked: {
    borderColor: stensylColors.inputBackground,
    opacity: 0.7,
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  compactIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  achievementTitleUnlocked: {
    color: stensylColors.textWhite,
  },
  achievementTitleLocked: {
    color: stensylColors.textMuted,
  },
  compactTitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  compactTitleUnlocked: {
    color: stensylColors.textWhite,
  },
  compactTitleLocked: {
    color: stensylColors.textMuted,
  },
  achievementDescription: {
    fontSize: 14,
    color: stensylColors.textMuted,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: stensylColors.inputBackground,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: stensylColors.textMuted,
    textAlign: 'right',
  },
});

export default Achievements; 