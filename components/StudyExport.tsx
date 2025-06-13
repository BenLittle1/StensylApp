import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { stensylColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface StudySession {
  id: string;
  created_at: string;
  topic: string;
  subject: string;
  duration: string;
  efficiency: number | null;
  notes: string | null;
}

interface StudyExportProps {
  posts: StudySession[];
  visible: boolean;
  onClose: () => void;
}

// Helper function to parse duration
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

// Helper function to format time
const formatTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

// Generate study summary text
const generateStudySummary = (posts: StudySession[], timeframe: string = 'This Week'): string => {
  const totalSessions = posts.length;
  const totalSeconds = posts.reduce((acc, post) => acc + parseDuration(post.duration), 0);
  const totalTime = formatTime(totalSeconds);
  
  // Subject breakdown
  const subjectStats = posts.reduce((acc, post) => {
    const subject = post.subject;
    const duration = parseDuration(post.duration);
    acc[subject] = (acc[subject] || 0) + duration;
    return acc;
  }, {} as Record<string, number>);

  const topSubject = Object.entries(subjectStats)
    .sort(([,a], [,b]) => b - a)[0]?.[0] || 'None';

  // Average efficiency
  const efficiencyScores = posts.filter(p => p.efficiency).map(p => p.efficiency!);
  const avgEfficiency = efficiencyScores.length > 0 
    ? (efficiencyScores.reduce((a, b) => a + b, 0) / efficiencyScores.length).toFixed(1)
    : 'N/A';

  return `📚 ${timeframe} Study Summary

🎯 ${totalSessions} study sessions completed
⏱️ ${totalTime} total study time
📖 Top subject: ${topSubject}
🔥 Average efficiency: ${avgEfficiency}/10

Keep crushing those study goals! 💪

#StudyWith #Stensyl #StudyMotivation`;
};

// Generate detailed CSV data
const generateCSVData = (posts: StudySession[]): string => {
  const headers = ['Date', 'Subject', 'Topic', 'Duration', 'Efficiency', 'Notes'];
  const rows = posts.map(post => [
    new Date(post.created_at).toLocaleDateString(),
    post.subject,
    post.topic,
    post.duration,
    post.efficiency?.toString() || '',
    post.notes?.replace(/,/g, ';') || '' // Replace commas to avoid CSV issues
  ]);

  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
};

export const StudyExport: React.FC<StudyExportProps> = ({ posts, visible, onClose }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  // Filter posts for different timeframes
  const getPostsForTimeframe = (timeframe: 'week' | 'month' | 'all') => {
    const now = new Date();
    switch (timeframe) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return posts.filter(post => new Date(post.created_at) >= weekAgo);
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return posts.filter(post => new Date(post.created_at) >= monthAgo);
      default:
        return posts;
    }
  };

  const handleQuickShare = async (timeframe: 'week' | 'month' | 'all') => {
    try {
      const timeframePosts = getPostsForTimeframe(timeframe);
      if (timeframePosts.length === 0) {
        Alert.alert('No Data', `No study sessions found for the selected timeframe.`);
        return;
      }

      const timeframeLabel = timeframe === 'week' ? 'This Week' : 
                           timeframe === 'month' ? 'This Month' : 'All Time';
      
      const summary = generateStudySummary(timeframePosts, timeframeLabel);

      if (Platform.OS === 'web') {
        // For web, copy to clipboard
        await navigator.clipboard.writeText(summary);
        Alert.alert('Copied!', 'Study summary copied to clipboard');
      } else {
        // For mobile, use native sharing
        await Share.share({
          message: summary,
          title: `${user?.user_metadata?.full_name || 'My'} Study Progress`
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share study summary');
    }
  };

  const handleExportCSV = async () => {
    try {
      setLoading(true);
      
      if (posts.length === 0) {
        Alert.alert('No Data', 'No study sessions to export.');
        return;
      }

      const csvData = generateCSVData(posts);
      const fileName = `stensyl-study-data-${new Date().toISOString().split('T')[0]}.csv`;

      if (Platform.OS === 'web') {
        // For web, download file
        const blob = new Blob([csvData], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        Alert.alert('Success', 'CSV file downloaded successfully!');
      } else {
        // For mobile, save and share file
        const fileUri = FileSystem.documentDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, csvData);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Success', `File saved to: ${fileUri}`);
        }
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export study data');
    } finally {
      setLoading(false);
    }
  };

  const shareOptions = [
    {
      id: 'week',
      title: 'Share This Week',
      description: `${getPostsForTimeframe('week').length} sessions`,
      icon: 'date-range' as const,
      onPress: () => handleQuickShare('week'),
    },
    {
      id: 'month',
      title: 'Share This Month', 
      description: `${getPostsForTimeframe('month').length} sessions`,
      icon: 'calendar-month' as const,
      onPress: () => handleQuickShare('month'),
    },
    {
      id: 'all',
      title: 'Share All Time',
      description: `${posts.length} sessions`,
      icon: 'timeline' as const,
      onPress: () => handleQuickShare('all'),
    },
    {
      id: 'csv',
      title: 'Export to CSV',
      description: 'Download detailed data',
      icon: 'download' as const,
      onPress: handleExportCSV,
    },
  ];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Share Your Progress</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialIcons name="close" size={24} color={stensylColors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollView}>
            <Text style={styles.description}>
              Share your study achievements with friends, export your data, or post your progress on social media!
            </Text>

            {shareOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.shareOption}
                onPress={option.onPress}
                disabled={loading}
              >
                <View style={styles.shareOptionIcon}>
                  <MaterialIcons
                    name={option.icon}
                    size={24}
                    color={stensylColors.primaryAccent}
                  />
                </View>
                <View style={styles.shareOptionContent}>
                  <Text style={styles.shareOptionTitle}>{option.title}</Text>
                  <Text style={styles.shareOptionDescription}>{option.description}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color={stensylColors.textMuted} />
              </TouchableOpacity>
            ))}

            <View style={styles.socialHint}>
              <MaterialIcons name="info" size={20} color={stensylColors.primaryAccent} />
              <Text style={styles.socialHintText}>
                Pro tip: Tag #StudyWith and #Stensyl when sharing on social media to connect with other studiers!
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: stensylColors.cardBackground,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '60%',
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
  scrollView: {
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: stensylColors.textMuted,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 20,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    backgroundColor: stensylColors.inputBackground,
    borderRadius: 12,
  },
  shareOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${stensylColors.primaryAccent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shareOptionContent: {
    flex: 1,
  },
  shareOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 4,
  },
  shareOptionDescription: {
    fontSize: 14,
    color: stensylColors.textMuted,
  },
  socialHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    margin: 20,
    backgroundColor: `${stensylColors.primaryAccent}10`,
    borderRadius: 12,
    borderLeftWidth: 3,
    borderLeftColor: stensylColors.primaryAccent,
  },
  socialHintText: {
    flex: 1,
    fontSize: 14,
    color: stensylColors.textMuted,
    marginLeft: 12,
    lineHeight: 20,
  },
}); 