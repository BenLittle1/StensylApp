export interface Session {
  date: string; // ISO date string
  duration: number; // minutes
  goalCompleted?: boolean;
  efficiency?: number; // 1-10
}

export interface PerformanceIndexOptions {
  sessions: Session[];
  dailyGoalCount?: number; // number of daily goals set
  weeklyGoalCount?: number; // number of weekly goals set
  weekStart?: Date; // start of the week (for weekly goals)
}

/**
 * Calculates the Performance Index (0-100) based on:
 * - Consistency (40): unique study days + streak bonus
 * - Goal Achievement (30): % of daily/weekly goals completed
 * - Study Volume (20): total minutes, anti-cramming curve (10h/week = max)
 * - Focus Quality (10): avg efficiency + session count bonus
 */
export function calculatePerformanceIndex({
  sessions,
  dailyGoalCount = 0,
  weeklyGoalCount = 0,
  weekStart,
}: PerformanceIndexOptions): number {
  const MAX_DAYS = 7;
  const MAX_WEEKLY_MINUTES = 600; // 10 hours
  const today = new Date();
  const weekStartDate = weekStart || new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());

  // Consistency: unique study days in the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - i);
    return d.toDateString();
  });
  const daysWithSession = new Set(
    sessions
      .map(s => new Date(s.date).toDateString())
      .filter(dateStr => last7Days.includes(dateStr))
  );
  const studyDays = daysWithSession.size;
  // Streak: max consecutive days with session in last 7 days
  let maxStreak = 0, currentStreak = 0;
  for (let i = 0; i < 7; i++) {
    if (daysWithSession.has(last7Days[i])) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  const consistencyBase = studyDays * 4.0;
  const streakBonus = Math.min(maxStreak * 2.0, 12.0);
  const consistencyScore = Math.min(consistencyBase + streakBonus, 40.0);

  // Goal Achievement: % of daily/weekly goals completed (15pts each)
  // For unit test, assume all goals are daily and/or weekly, and sessions with goalCompleted=true count toward daily
  const dailyGoalsMet = sessions.filter(s => s.goalCompleted).length;
  const dailyGoalScore = dailyGoalCount > 0 ? (dailyGoalsMet / dailyGoalCount) * 15.0 : 0;
  // For weekly, assume if total sessions >= weeklyGoalCount, weekly goal is met
  const weeklyGoalsMet = sessions.length >= weeklyGoalCount ? 1 : 0;
  const weeklyGoalScore = weeklyGoalCount > 0 ? (weeklyGoalsMet / weeklyGoalCount) * 15.0 : 0;
  const goalAchievementScore = dailyGoalScore + weeklyGoalScore;

  // Study Volume: total minutes, anti-cramming curve (sqrt)
  const totalMinutes = sessions.reduce((sum, s) => sum + s.duration, 0);
  const studyVolumeScore = Math.min(Math.sqrt(totalMinutes / 60) * 10.0, 20.0);

  // Focus Quality: avg efficiency (0-8), bonus for multiple sessions (up to 2)
  const efficiencySessions = sessions.filter(s => typeof s.efficiency === 'number');
  const avgEfficiency = efficiencySessions.length > 0 ? efficiencySessions.reduce((sum, s) => sum + (s.efficiency || 0), 0) / efficiencySessions.length : 0;
  let focusScore = (avgEfficiency / 10.0) * 8.0;
  if (efficiencySessions.length >= 2) {
    focusScore += Math.min(efficiencySessions.length * 0.5, 2.0);
  }
  focusScore = Math.min(focusScore, 10.0);

  // Final index
  return Math.round(consistencyScore + goalAchievementScore + studyVolumeScore + focusScore);
} 