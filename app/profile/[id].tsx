import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { stensylColors } from '@/constants/Colors';
import { useAuth } from '@/context/AuthContext';

// Define the structure for a user profile
interface Profile {
  id: string;
  full_name: string;
  website: string | null;
  // Add other fields like avatar_url if you want them
}

export default function UserProfileScreen() {
  const { id: profileId } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // New state for follow logic
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!profileId) return;
      setLoading(true);

      try {
        // Fetch profile details
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .single();
        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch follow counts
        const { count: followers, error: followersError } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('following_id', profileId);
        if(followersError) throw followersError;
        setFollowerCount(followers || 0);

        const { count: following, error: followingError } = await supabase
            .from('follows')
            .select('*', { count: 'exact', head: true })
            .eq('follower_id', profileId);
        if(followingError) throw followingError;
        setFollowingCount(following || 0);

        // Check if current user is following this profile
        if (user) {
            const { data: followData, error: followError } = await supabase
                .from('follows')
                .select('*')
                .eq('follower_id', user.id)
                .eq('following_id', profileId)
                .single();
            setIsFollowing(!!followData);
        }

      } catch (error: any) {
        Alert.alert('Error', 'Failed to fetch user profile data.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [profileId, user]);

  const handleFollowToggle = async () => {
      if (!user || isSubmitting) return;
      setIsSubmitting(true);

      if (isFollowing) { // Unfollow logic
          try {
              const { error } = await supabase
                .from('follows')
                .delete()
                .eq('follower_id', user.id)
                .eq('following_id', profileId);
            
            if (error) throw error;
            setIsFollowing(false);
            setFollowerCount(c => c - 1);
          } catch(e: any) {
              Alert.alert('Error', 'Could not unfollow user.');
          }
      } else { // Follow logic
          try {
              const { error } = await supabase
                .from('follows')
                .insert({ follower_id: user.id, following_id: profileId });
            
            if (error) throw error;
            setIsFollowing(true);
            setFollowerCount(c => c + 1);
          } catch(e: any) {
              Alert.alert('Error', 'Could not follow user.');
          }
      }
      setIsSubmitting(false);
  }

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={stensylColors.primaryAccent} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>User profile not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: profile.full_name || 'Profile' }} />
      <Text style={styles.name}>{profile.full_name}</Text>
      <Text style={styles.website}>{profile.website || 'No website provided.'}</Text>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
            <Text style={styles.statCount}>{followerCount}</Text>
            <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statItem}>
            <Text style={styles.statCount}>{followingCount}</Text>
            <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>

      {user && user.id !== profileId && (
        <TouchableOpacity 
            onPress={handleFollowToggle} 
            style={[styles.button, isFollowing ? styles.unfollowButton : styles.followButton]}
            disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>{isFollowing ? 'Unfollow' : 'Follow'}</Text>
        </TouchableOpacity>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: stensylColors.background,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: stensylColors.background,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
  },
  website: {
    fontSize: 16,
    color: stensylColors.textMuted,
    marginTop: 8,
  },
  errorText: {
    color: stensylColors.errorRed,
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
    marginVertical: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statCount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: stensylColors.textWhite,
  },
  statLabel: {
    fontSize: 14,
    color: stensylColors.textMuted,
    marginTop: 4,
  },
  button: {
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 8,
      marginTop: 20,
  },
  followButton: {
      backgroundColor: stensylColors.primaryAccent,
  },
  unfollowButton: {
      backgroundColor: stensylColors.cardBackground,
      borderWidth: 1,
      borderColor: stensylColors.primaryAccent,
  },
  buttonText: {
      color: stensylColors.textWhite,
      fontWeight: 'bold',
      fontSize: 16,
  }
}); 