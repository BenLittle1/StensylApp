import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Href, useRouter } from 'expo-router';
import { stensylColors } from '@/constants/Colors'; // Adjusted import path
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

// Post Item Component
export interface PostItemProps {
  id: string;
  userName: string;
  avatarUrl?: string; // Kept as optional
  timestamp: string;
  location: string;
  timeStudied: string;
  description: string;
  userId: string; // Add userId to check ownership
  onDelete?: (id: string) => void; // Optional callback to refresh feed
}

const PostItem: React.FC<PostItemProps> = ({
  id,
  userName,
  // avatarUrl, // Not used yet, placeholder is used
  timestamp,
  location,
  timeStudied,
  description,
  userId,
  onDelete,
}) => {
  const router = useRouter();
  const { user } = useAuth(); // Get current user

  // Debug logging for delete button visibility
  console.log('PostItem render:', { 
    userExists: !!user, 
    userId: user?.id, 
    postUserId: userId, 
    shouldShowDelete: user && user.id === userId 
  });

  const handleCommentPress = () => {
    console.log(`Attempting to navigate to comments for post ID: ${id}.`);
    if (id) {
      router.push(`/comments/${id}` as Href); // Assuming a route like /comments/[id].tsx
    } else {
      console.error("Post ID is undefined for comment navigation.");
    }
  };

  const handleSharePress = async () => {
    try {
      const result = await Share.share({
        message: `Check out this study post by ${userName} on Stensyl! \"${description.substring(0,100)}...\"\n\n#StensylApp #StudyMotivation`,
        title: `Post by ${userName} on Stensyl`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Content shared successfully!');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share action dismissed.');
      }
    } catch (error: any) {
      console.error('Error sharing:', error.message);
    }
  };

  const handleDeletePress = async () => {
    if (Platform.OS === 'web') {
      // Bypass Alert on web
      try {
        console.log('Attempting to delete post (web):', id);
        const { error } = await supabase
          .from('posts')
          .delete()
          .eq('id', id);
        if (error) {
          console.error('Delete error:', error);
          throw error;
        }
        console.log('Post deleted successfully');
        if (onDelete) {
          onDelete(id);
        }
      } catch (e: any) {
        console.error('Delete failed:', e);
        alert("Deletion Failed: " + e.message);
      }
    } else {
      // Native: show confirmation
      Alert.alert(
        "Delete Post",
        "Are you sure you want to permanently delete this study session?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              try {
                console.log('Attempting to delete post:', id);
                const { error } = await supabase
                  .from('posts')
                  .delete()
                  .eq('id', id);
                if (error) {
                  console.error('Delete error:', error);
                  throw error;
                }
                console.log('Post deleted successfully');
                if (onDelete) {
                  onDelete(id);
                }
              } catch (e: any) {
                console.error('Delete failed:', e);
                Alert.alert("Deletion Failed", e.message);
              }
            }
          }
        ]
      );
    }
  };

  return (
    <View style={styles.postContainer}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.avatarPlaceholder}>
          {/* Later: Conditionally render Image if avatarUrl is present */}
          <MaterialIcons name="person" size={24} color={stensylColors.textMuted} />
        </View>
        <View style={styles.postHeaderTextContainer}>
          <Text style={styles.postUserName}>{userName}</Text>
          <Text style={styles.postMetaText}>{timestamp} | {location}</Text>
        </View>
        <View style={styles.postTimeStudiedContainer}>
          <Text style={styles.postTimeStudiedLabel}>Time Studied</Text>
          <Text style={styles.postTimeStudiedValue}>{timeStudied}</Text>
        </View>
        
        {/* Show delete icon only if the current user owns the post */}
        {user && user.id === userId && (
          <TouchableOpacity onPress={handleDeletePress} style={styles.deleteButton}>
            <MaterialIcons name="delete-outline" size={24} color={stensylColors.errorRed} />
          </TouchableOpacity>
        )}
      </View>

      {/* Post Description */}
      <Text style={styles.postDescription}>{description}</Text>

      {/* Post Content Placeholder - can be expanded later */}
      <View style={styles.postContentPlaceholder} />

      {/* Post Actions */}
      <View style={styles.postActionsContainer}>
        <TouchableOpacity style={styles.postActionButton} onPress={() => console.log('Like pressed for post:', id)}>
          <MaterialIcons name="thumb-up-off-alt" size={22} color={stensylColors.iconColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.postActionButton} onPress={handleCommentPress}>
          <MaterialIcons name="chat-bubble-outline" size={22} color={stensylColors.iconColor} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.postActionButton} onPress={handleSharePress}>
          <MaterialIcons name="share" size={22} color={stensylColors.iconColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const pageHorizontalPadding = 16;

const styles = StyleSheet.create({
  postContainer: {
    backgroundColor: stensylColors.cardBackground,
    borderRadius: 12,
    padding: pageHorizontalPadding,
    marginBottom: 16,
    marginHorizontal: pageHorizontalPadding, // Added to match example style
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: stensylColors.postPlaceholderBg, // Corrected from example
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  postHeaderTextContainer: {
    flex: 1,
  },
  postUserName: {
    color: stensylColors.textWhite,
    fontWeight: 'bold',
    fontSize: 15,
  },
  postMetaText: {
    color: stensylColors.textMuted,
    fontSize: 12,
  },
  postTimeStudiedContainer: {
    alignItems: 'flex-end',
  },
  postTimeStudiedLabel: {
    color: stensylColors.textMuted,
    fontSize: 11,
  },
  postTimeStudiedValue: {
    color: stensylColors.textWhite,
    fontSize: 14,
    fontWeight: 'bold',
  },
  postDescription: {
    color: stensylColors.textWhite,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  postContentPlaceholder: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: stensylColors.postPlaceholderBg, // Corrected from example
    borderRadius: 8,
    marginBottom: 12,
  },
  postActionsContainer: {
    flexDirection: 'row',
    paddingTop: 8,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  postActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingRight: 20,
  },
  deleteButton: {
    marginLeft: 10,
    padding: 5,
  },
});

export default PostItem; 