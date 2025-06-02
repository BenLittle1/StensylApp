import { MaterialIcons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react'; // Added useState
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';


// Define your theme colors (consistent with other pages)
const stensylColors = {
  background: '#101a23',
  headerBackground: 'rgba(16, 26, 35, 0.8)', // Or your main background if header is transparent
  textWhite: '#ffffff',
  textMuted: '#90aecb',
  cardBackground: '#1a2633',
  inputBackground: '#223649',
  primaryAccent: '#0b80ee',
  iconWhite: '#ffffff', // For back button if needed, or general icons
};

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp?: string; // Optional: for displaying when the comment was made
}

const CommentsScreen = () => {
  const router = useRouter();
  const { postId } = useLocalSearchParams<{ postId: string }>(); // Get postId from route params
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<Comment[]>([ // Placeholder comments
    { id: 'c1', user: 'User123', text: 'Great post! Very insightful.', timestamp: '2h ago' },
    { id: 'c2', user: 'StudyBuddy', text: 'Thanks for sharing this. Helped a lot!', timestamp: '1h ago' },
  ]);

  // You would typically fetch comments for the postId here
  useEffect(() => {
    if (postId) {
      console.log('Fetching comments for post ID:', postId);
      // TODO: Fetch comments logic based on postId
      // Example: fetchComments(postId).then(setComments);
    }
  }, [postId]);

  const handlePostComment = () => {
    if (commentText.trim()) {
      console.log(`Posting comment for post ${postId}: ${commentText}`);
      // TODO: API call to post comment
      // For now, add comment to list locally and clear input
      const newComment: Comment = {
        id: `c${Date.now()}`, // Simple unique ID
        user: 'CurrentUser', // Replace with actual logged-in user
        text: commentText.trim(),
        timestamp: 'Just now',
      };
      setComments(prev => [newComment, ...prev]); // Add new comment to the top
      setCommentText('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      {/* Configure header options directly in the screen component */}
      <Stack.Screen options={{ 
        title: `Comments`, // Or you could do: `Post ${postId} Comments`
        headerStyle: { backgroundColor: stensylColors.headerBackground },
        headerTintColor: stensylColors.iconWhite, // Color for back arrow and title
        headerTitleStyle: { color: stensylColors.textWhite },
        headerBackTitleVisible: false, // Hides "Back" text on iOS next to arrow
      }} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingContainer}
        // Adjust keyboardVerticalOffset if your header has a different height
        // or if there are tabs at the bottom.
        keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0} 
      >
        <ScrollView style={styles.commentsScrollView} contentContainerStyle={styles.commentsScrollContentContainer}>
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentUser}>{comment.user}</Text>
                {comment.timestamp && <Text style={styles.commentTimestamp}>{comment.timestamp}</Text>}
              </View>
              <Text style={styles.commentText}>{comment.text}</Text>
            </View>
          ))}
          {comments.length === 0 && (
            <Text style={styles.noCommentsText}>No comments yet. Be the first!</Text>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Write a comment..."
            placeholderTextColor={stensylColors.textMuted}
            value={commentText}
            onChangeText={setCommentText}
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handlePostComment} disabled={!commentText.trim()}>
            <MaterialIcons name="send" size={24} color={commentText.trim() ? stensylColors.primaryAccent : stensylColors.textMuted} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: stensylColors.background,
  },
  keyboardAvoidingContainer: {
    flex: 1,
  },
  commentsScrollView: {
    flex: 1,
  },
  commentsScrollContentContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10, // Space at the bottom of the scroll list
  },
  commentItem: {
    backgroundColor: stensylColors.cardBackground,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  commentUser: {
    color: stensylColors.primaryAccent,
    fontWeight: 'bold',
    fontSize: 14,
  },
  commentTimestamp: {
    color: stensylColors.textMuted,
    fontSize: 12,
  },
  commentText: {
    color: stensylColors.textWhite,
    fontSize: 15,
    lineHeight: 20,
  },
  noCommentsText: {
    color: stensylColors.textMuted,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: stensylColors.cardBackground, 
    backgroundColor: stensylColors.background, 
  },
  textInput: {
    flex: 1,
    backgroundColor: stensylColors.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 10 : 8, // Adjust padding for different platforms
    paddingBottom: Platform.OS === 'ios' ? 10 : 8,
    marginRight: 10,
    color: stensylColors.textWhite,
    fontSize: 16,
    maxHeight: 100, 
  },
  sendButton: {
    padding: 8,
  },
});

export default CommentsScreen;
