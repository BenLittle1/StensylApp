import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { stensylColors } from '@/constants/Colors';
import { Stack, useFocusEffect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { StudyExport } from '@/components/StudyExport';
import { MaterialIcons } from '@expo/vector-icons';


// Local type definition for Posts, matching the data structure
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

// Helper to parse HH:MM:SS string to seconds
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

// Helper to format total seconds into a readable string
const formatTotalTime = (totalSeconds: number): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const StatBox = ({ label, value }: { label: string; value: string | number }) => (
  <View style={styles.statBox}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);



export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchUserPosts = async () => {
        if (!user) {
          if (isActive) setLoading(false);
          return;
        }
        // Only set loading true on the initial fetch for a smoother UX on re-focus
        if (posts.length === 0) {
            setLoading(true);
        }

        try {
          const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (isActive) {
            if (error) throw error;
            setPosts(data || []);
          }
        } catch (error: any) {
          if (isActive) Alert.alert('Error fetching stats', error.message);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchUserPosts();

      return () => {
        isActive = false;
      };
    }, [user, posts.length])
  );

  const totalSessions = posts.length;
  const totalSecondsStudied = posts.reduce((acc, post) => acc + parseDuration(post.duration), 0);
  const averageSessionSeconds = totalSessions > 0 ? totalSecondsStudied / totalSessions : 0;



  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error: any) {
      Alert.alert('Sign Out Failed', error.message);
    }
  };



  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                onPress={() => setExportModalVisible(true)} 
                style={styles.shareButton}
              >
                <MaterialIcons name="share" size={20} color={stensylColors.primaryAccent} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
                <Text style={styles.signOutButtonText}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={stensylColors.primaryAccent} />
        </View>
      ) : (
        <ScrollView style={styles.contentScrollView}>
          <Text style={styles.title}>{user?.user_metadata?.full_name || 'Your Profile'}</Text>
          
          <View style={styles.statsContainer}>
            <StatBox label="Total Time" value={formatTotalTime(totalSecondsStudied)} />
            <StatBox label="Sessions" value={totalSessions} />
            <StatBox label="Avg. Session" value={`${formatTotalTime(averageSessionSeconds)}`} />
          </View>

          {/* Study Summary */}
          <View style={styles.goalsSection}>
            <Text style={styles.sectionTitle}>Study Summary</Text>
            <Text style={styles.summaryText}>
              You've completed {totalSessions} study sessions with a total time of {formatTotalTime(totalSecondsStudied)}.
              {totalSessions > 0 && ` Your average session is ${formatTotalTime(averageSessionSeconds)}.`}
            </Text>
            {totalSessions === 0 && (
              <Text style={styles.summaryText}>
                Start your first study session to see your progress here!
              </Text>
            )}
          </View>

          <Text style={styles.userInfo}>
            Signed in as: {user?.email}
          </Text>
        </ScrollView>
      )}

      {/* Export/Share Modal */}
      <StudyExport
        posts={posts}
        visible={exportModalVisible}
        onClose={() => setExportModalVisible(false)}
      />
    </SafeAreaView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  contentScrollView: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 30, // Increased margin
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 40,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
  },
  statLabel: {
    fontSize: 14,
    color: stensylColors.textMuted,
    marginTop: 4,
  },
  userInfo: {
    fontSize: 14,
    color: stensylColors.textMuted,
    marginTop: 40, // Added margin to push it down
  },
  signOutButton: {
    marginRight: 16,
    padding: 8,
  },
  signOutButtonText: {
    color: stensylColors.primaryAccent,
    fontSize: 16,
  },
  centered: { // New style for centering the loader
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  goalsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: stensylColors.textWhite,
    marginBottom: 16,
    marginLeft: 16,
  },
  summaryText: {
    fontSize: 16,
    color: stensylColors.textMuted,
    lineHeight: 24,
    marginHorizontal: 16,
  },
  
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  shareButton: {
    padding: 8,
    marginRight: 8,
  },
}); 