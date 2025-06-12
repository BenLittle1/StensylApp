import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Switch, ScrollView, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface StudyReminder {
  id: string;
  time: string;
  days: string[];
  isEnabled: boolean;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

interface StudyRemindersProps {
  compact?: boolean;
}

const defaultReminders: StudyReminder[] = [
  {
    id: 'morning',
    time: '09:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    isEnabled: false,
    label: 'Morning Study',
    icon: 'wb-sunny',
  },
  {
    id: 'afternoon',
    time: '14:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    isEnabled: false,
    label: 'Afternoon Focus',
    icon: 'access-time',
  },
  {
    id: 'evening',
    time: '19:00',
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    isEnabled: false,
    label: 'Evening Review',
    icon: 'nights-stay',
  },
  {
    id: 'weekend',
    time: '10:00',
    days: ['Saturday', 'Sunday'],
    isEnabled: false,
    label: 'Weekend Study',
    icon: 'weekend',
  },
];

const STORAGE_KEY = '@study_reminders';

export const StudyReminders: React.FC<StudyRemindersProps> = ({ compact = false }) => {
  const [reminders, setReminders] = useState<StudyReminder[]>(defaultReminders);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setReminders(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load reminders:', error);
    }
  };

  const saveReminders = async (newReminders: StudyReminder[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newReminders));
      setReminders(newReminders);
    } catch (error) {
      console.error('Failed to save reminders:', error);
      Alert.alert('Error', 'Failed to save reminder settings');
    }
  };

  const toggleReminder = (id: string) => {
    const newReminders = reminders.map(reminder =>
      reminder.id === id ? { ...reminder, isEnabled: !reminder.isEnabled } : reminder
    );
    saveReminders(newReminders);

    // Show feedback message
    const reminder = newReminders.find(r => r.id === id);
    if (reminder?.isEnabled) {
      Alert.alert(
        'Reminder Set! 🔔',
        `You'll be reminded to study for ${reminder.label} at ${reminder.time}`,
        [{ text: 'Got it!', style: 'default' }]
      );
    }
  };

  const formatDays = (days: string[]): string => {
    if (days.length === 7) return 'Every day';
    if (days.length === 5 && !days.includes('Saturday') && !days.includes('Sunday')) {
      return 'Weekdays';
    }
    if (days.length === 2 && days.includes('Saturday') && days.includes('Sunday')) {
      return 'Weekends';
    }
    if (days.length <= 3) {
      return days.map(d => d.slice(0, 3)).join(', ');
    }
    return `${days.length} days`;
  };

  const getNextReminderTime = (): string => {
    const now = new Date();
    const activeReminders = reminders.filter(r => r.isEnabled);
    
    if (activeReminders.length === 0) return 'No reminders set';

    // Find the next upcoming reminder
    let nextReminder: StudyReminder | null = null;
    let nextDate: Date | null = null;

    for (const reminder of activeReminders) {
      const [hours, minutes] = reminder.time.split(':').map(Number);
      
      for (let i = 0; i < 7; i++) {
        const testDate = new Date(now);
        testDate.setDate(now.getDate() + i);
        const dayName = testDate.toLocaleDateString('en-US', { weekday: 'long' });
        
        if (reminder.days.includes(dayName)) {
          testDate.setHours(hours, minutes, 0, 0);
          
          if (testDate > now && (!nextDate || testDate < nextDate)) {
            nextDate = testDate;
            nextReminder = reminder;
          }
        }
      }
    }

    if (nextReminder && nextDate) {
      const timeString = nextDate.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit' 
      });
      const dayString = nextDate.toLocaleDateString('en-US', { 
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
      return `${nextReminder.label} - ${dayString} at ${timeString}`;
    }

    return 'No upcoming reminders';
  };

  if (compact) {
    const activeCount = reminders.filter(r => r.isEnabled).length;
    const nextReminder = getNextReminderTime();

    return (
      <View style={styles.compactContainer}>
        <Text style={styles.compactTitle}>Study Reminders</Text>
        <View style={styles.compactContent}>
          <View style={styles.compactStats}>
            <MaterialIcons name="notifications" size={20} color={stensylColors.primaryAccent} />
            <Text style={styles.compactStatsText}>
              {activeCount} active reminder{activeCount !== 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.compactNextReminder}>{nextReminder}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Study Reminders</Text>
      <Text style={styles.subtitle}>Set up notifications to help you stay consistent</Text>
      
      <ScrollView style={styles.remindersContainer}>
        {reminders.map((reminder) => (
          <View key={reminder.id} style={styles.reminderCard}>
            <View style={styles.reminderHeader}>
              <View style={styles.reminderInfo}>
                <MaterialIcons 
                  name={reminder.icon} 
                  size={24} 
                  color={reminder.isEnabled ? stensylColors.primaryAccent : stensylColors.textMuted} 
                />
                <View style={styles.reminderDetails}>
                  <Text style={[
                    styles.reminderLabel,
                    { color: reminder.isEnabled ? stensylColors.textWhite : stensylColors.textMuted }
                  ]}>
                    {reminder.label}
                  </Text>
                  <Text style={styles.reminderTime}>
                    {reminder.time} • {formatDays(reminder.days)}
                  </Text>
                </View>
              </View>
              <Switch
                trackColor={{ false: stensylColors.toggleInactive, true: stensylColors.toggleActive }}
                thumbColor={stensylColors.textWhite}
                ios_backgroundColor={stensylColors.toggleInactive}
                onValueChange={() => toggleReminder(reminder.id)}
                value={reminder.isEnabled}
              />
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.infoCard}>
        <MaterialIcons name="info" size={20} color={stensylColors.primaryAccent} />
        <Text style={styles.infoText}>
          Reminders help build consistent study habits. Enable notifications in your device settings for the best experience.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  compactContainer: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: stensylColors.inputBackground,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: stensylColors.textWhite,
    marginBottom: 8,
  },
  compactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: stensylColors.textMuted,
    marginBottom: 20,
  },
  remindersContainer: {
    marginBottom: 20,
  },
  compactContent: {
    gap: 8,
  },
  compactStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactStatsText: {
    fontSize: 14,
    color: stensylColors.textWhite,
    fontWeight: '500',
  },
  compactNextReminder: {
    fontSize: 12,
    color: stensylColors.textMuted,
    fontStyle: 'italic',
  },
  reminderCard: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: stensylColors.inputBackground,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reminderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  reminderDetails: {
    marginLeft: 12,
    flex: 1,
  },
  reminderLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 14,
    color: stensylColors.textMuted,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: stensylColors.primaryAccent + '20',
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  infoText: {
    fontSize: 14,
    color: stensylColors.textWhite,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
});

export default StudyReminders; 