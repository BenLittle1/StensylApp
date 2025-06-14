import PostItem, { PostItemProps } from '@/components/PostItem';
import { StudyExport } from '@/components/StudyExport';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { stensylColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Stack, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

interface Profile {
  full_name?: string;
  avatar_url?: string;
  location?: string;
  bio?: string;
}

// New transform function for profile posts
const transformSupabasePost = (post: Post): Omit<PostItemProps, 'onDelete'> => {
  return {
    id: post.id,
    userName: post.user_name || 'Anonymous',
    timestamp: new Date(post.created_at).toLocaleString(),
    location: "Online", // Assuming location isn't in post data
    timeStudied: post.duration,
    description: `${post.topic}\nSubject: ${post.subject}${post.notes ? `\nNotes: ${post.notes}` : ''}`,
    userId: post.user_id,
  };
};

export default function ProfileScreen() {
  const { signOut, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportModalVisible, setExportModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchData = async () => {
        if (!user) {
          if (isActive) setLoading(false);
          return;
        }

        setLoading(true);

        try {
          // Fetch profile information
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, location, bio')
            .eq('id', user.id)
            .single();

          if (profileError) throw profileError;
          if (isActive) setProfile(profileData);

          // Fetch posts for stats
          const { data: postsData, error: postsError } = await supabase
            .from('posts')
            .select('*')
            .eq('user_id', user.id);

          if (postsError) throw postsError;
          if (isActive) setPosts(postsData || []);
        } catch (error: any) {
          if (isActive) Alert.alert('Error', error.message);
        } finally {
          if (isActive) setLoading(false);
        }
      };

      fetchData();

      return () => {
        isActive = false;
      };
    }, [user])
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

  const handleDeletePost = (deletedPostId: string) => {
    setPosts(currentPosts => currentPosts.filter(post => post.id !== deletedPostId));
  };
  
  const transformedPosts = posts.map(post => ({
    ...transformSupabasePost(post),
    onDelete: handleDeletePost,
  }));

  const renderProfileHeader = () => (
    <>
      <View style={styles.header}>
        {profile?.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <IconSymbol name="person.fill" size={40} color={stensylColors.background} />
          </View>
        )}
        <View>
          <Text style={styles.name}>{profile?.full_name || 'Anonymous User'}</Text>
          <Text style={styles.location}>{profile?.location || 'No location provided'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.description}>{profile?.bio || 'No description available.'}</Text>
      </View>

      <View style={styles.statsContainer}>
        <StatBox label="Total Time" value={formatTotalTime(totalSecondsStudied)} />
        <StatBox label="Sessions" value={totalSessions} />
        <StatBox label="Avg. Session" value={`${formatTotalTime(averageSessionSeconds)}`} />
      </View>
      
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>My Posts</Text>
    </>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={stensylColors.primaryAccent} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <FlatList
        data={transformedPosts}
        renderItem={({ item }) => <PostItem {...item} />}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderProfileHeader}
        ListFooterComponent={
          <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
            <Text style={styles.signOutButtonText}>Sign Out</Text>
          </TouchableOpacity>
        }
        showsVerticalScrollIndicator={false}
      />

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
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: stensylColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: stensylColors.inputBackground,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: stensylColors.textMuted,
  },
  name: {
    color: stensylColors.textWhite,
    fontSize: 24,
    fontWeight: 'bold',
  },
  location: {
    color: stensylColors.textMuted,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 10,
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
  },
  statLabel: {
    fontSize: 14,
    color: stensylColors.textMuted,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  description: {
    color: stensylColors.textMuted,
    fontSize: 16,
  },
  signOutButton: {
    marginVertical: 40, // Give it space from the list
    padding: 12,
    borderRadius: 8,
    backgroundColor: stensylColors.cardBackground,
    alignItems: 'center',
    marginHorizontal: 20, // To match the container padding
  },
  signOutButtonText: {
    color: stensylColors.primaryAccent,
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
    marginBottom: 16,
  },
}); 