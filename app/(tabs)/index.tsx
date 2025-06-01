import React, { useMemo } from 'react';
import { SafeAreaView, ScrollView, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';
import HeatMapCalendar from '../../components/HeatMapCalendar';
import useSessions from '@/hooks/useSessions';
import { formatTime } from '@/utils/formatters';

import { SessionData } from '@/types';

/**
 * Convert Date or ISO string → YYYY‑MM‑DD (for streak calculation).
 */
const toYYYYMMDD = (d: Date | string) => {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toISOString().split('T')[0];
};

export default function HomeScreen() {
  // Load all local sessions via the custom hook.
  const { sessions, refresh, isLoading } = useSessions();

  // Refresh whenever the tab regains focus.
  useFocusEffect(React.useCallback(() => {
    refresh();
  }, [refresh]));

  /**
   * Derive total focused time (seconds) & current streak (days)
   * from the sessions array.
   */
  const { totalTime, streak } = useMemo(() => {
    if (!sessions.length) return { totalTime: 0, streak: 0 };

    // 1) Total time
    const total = sessions.reduce((sum, s) => sum + s.duration, 0);

    // 2) Streak
    const uniqueDays = new Set(sessions.map((s) => toYYYYMMDD(s.completedAt)));
    let currentStreak = 0;

    // Start counting from today → backwards
    let cursor = new Date();
    if (!uniqueDays.has(toYYYYMMDD(cursor))) {
      // If no session today, allow the streak to anchor on yesterday instead
      cursor.setDate(cursor.getDate() - 1);
      if (!uniqueDays.has(toYYYYMMDD(cursor))) {
        return { totalTime: total, streak: 0 }; // gap > 1 day → no streak
      }
    }

    // Anchor found; walk backwards until a gap.
    while (uniqueDays.has(toYYYYMMDD(cursor))) {
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }

    return { totalTime: total, streak: currentStreak };
  }, [sessions]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>Loading dashboard…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Welcome to Stensyl!</Text>

        {/* Total time card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Total Time Focused</Text>
          <Text style={styles.totalTimeText}>{formatTime(totalTime)}</Text>
          {totalTime === 0 && <Text style={styles.subText}>No study sessions logged yet.</Text>}
        </View>

        {/* Streak card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Study Streak</Text>
          <Text style={styles.streakText}>{streak} Day{streak !== 1 ? 's' : ''} 🔥</Text>
          {streak === 0 && <Text style={styles.subText}>Log a session today or yesterday to start a streak!</Text>}
        </View>

        {/* Heat‑map */}
        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <Text style={styles.cardTitle}>Year in Focus</Text>
          <HeatMapCalendar sessions={sessions as SessionData[]} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 25,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    marginBottom: 10,
  },
  totalTimeText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 5,
  },
  streakText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF9800',
    marginBottom: 5,
  },
  subText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});
